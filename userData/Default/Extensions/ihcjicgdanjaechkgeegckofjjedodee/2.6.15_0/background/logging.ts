import {getExclusionService} from "@/domain/exclusion-service";
import {SettingsStore} from "@/domain/stores/settings";
import {SETTING_VERBOSE_LOGGING} from "@/domain/types/settings";
import {indexedDB} from "@/utils/polyfill.js";
import {browserVersion} from "@/utils/ua-parser.js";
import {isIncognito} from "@/utils/utils.js";
import {INTERNAL_VERSION} from "./definitions";

const LOGGED_URLS = new Set();
let CONSOLE_TRACE = "";
let SESSION_LOG = "";

const sessionId = new Date().getTime();

const logStoreName = "cachedLogsStore";
const maxSessionLogSize = 5242880; //~5MB
const maxLogSize = 10485760; //~10MB

const doubleQuoteRegex = new RegExp('"', "g");

function mbwLogger(
    console: Console
): Console & {logOnce: (url: string, ...message: any[]) => void} {
    const logToStorage = (message: string = "", level) => {
        // hacky way of checking byte size (every .6~ mb save to cache)
        if (CONSOLE_TRACE.length > 781250) {
            flushLogs();
        }
        CONSOLE_TRACE +=
            `{"@timestamp": "${new Date().toISOString()}", ` +
            `"session": "${sessionId}", ` +
            `"message": "${message
                .toString()
                .replace(doubleQuoteRegex, "'")}", ` +
            `"level": "${level}"}\n`;
    };

    return {
        ...console,
        info: (msg, ...args) => {
            logToStorage(msg + " " + JSON.stringify(args), "INFO");
            console.info(msg, ...args);
        },
        log: (msg, ...args) => {
            logToStorage(msg + " " + JSON.stringify(args), "INFO");
            console.log(msg, ...args);
        },
        warn: (msg, ...args) => {
            SettingsStore.getInstance()
                .getSetting(SETTING_VERBOSE_LOGGING)
                .then((verboseLogging) => {
                    if (verboseLogging) {
                        logToStorage(msg + " " + JSON.stringify(args), "WARN");
                    }
                });
            console.warn(msg, ...args);
        },
        debug: (msg, ...args) => {
            SettingsStore.getInstance()
                .getSetting(SETTING_VERBOSE_LOGGING)
                .then((verboseLogging) => {
                    if (verboseLogging) {
                        logToStorage(msg + " " + JSON.stringify(args), "DEBUG");
                    }
                });
            console.debug(msg, ...args);
        },
        error: (msg, ...args) => {
            logToStorage(msg + " " + JSON.stringify(args), "ERROR");
            console.error(msg, ...args);
        },
        trace: (msg, ...args) => console.trace(msg, ...args),
        logOnce: logOnce,
    };
}

function logOnce(url: string, ...args: any[]) {
    if (LOGGED_URLS.has(url)) {
        console.debug(...args);
    } else {
        console.log(...args);
        trackLoggedUrl(url);
    }
}

export function trackLoggedUrl(url) {
    if (!LOGGED_URLS.has(url)) {
        LOGGED_URLS.add(url);
    }
}

export function clearLoggedUrls() {
    LOGGED_URLS.clear();
}

function logGet(store: IDBObjectStore): Promise<unknown> {
    return new Promise<unknown>((res) => {
        const logGet = store.get("current");
        logGet.onsuccess = () => res(logGet.result && logGet.result.data);
        logGet.onerror = (_e) => res(null);
    });
}

function flushSessionLog(log: string) {
    SESSION_LOG += log;
    if (SESSION_LOG.length > maxSessionLogSize) {
        SESSION_LOG = SESSION_LOG.slice(SESSION_LOG.length - maxSessionLogSize);
    }
}

export function flushLogs(): Promise<any> {
    let log = CONSOLE_TRACE;
    CONSOLE_TRACE = "";
    flushSessionLog(log);

    return new Promise((res) => {
        if (!indexedDB || isIncognito()) {
            return res(null);
        }

        const request = indexedDB.open(logStoreName, 1);
        let db;
        let tx;
        let store;

        // this fires on first time database is created
        request.onupgradeneeded = () => {
            db = request.result;
            store = db.createObjectStore(logStoreName, {keyPath: "logs"});
        };

        request.onerror = res;

        request.onsuccess = async () => {
            db = request.result;
            tx = db.transaction(logStoreName, "readwrite");
            store = tx.objectStore(logStoreName);

            db.onerror = res;

            let savedLogs = (await logGet(store)) as string;

            console.debug("LTI: Retrieved saved logs");
            // purge the first half -- we don't want it to get too big.
            // If the user has a very small machine we get capped at 10mb
            // and the logs get deleted anyways. Best practice either way to keep things slim
            if (savedLogs && savedLogs.length > maxLogSize) {
                savedLogs = savedLogs.slice(savedLogs.length - maxLogSize);
            }

            const dataPut = store.put({
                logs: "current",
                data: savedLogs ? savedLogs + log : log,
            });

            dataPut.onsuccess = () => {
                console.debug("LTI: Successfully Saved Logs");
                tx.oncomplete = () => db.close();
                res(void 0);
            };
            dataPut.onerror = (e) => {
                console.debug("LTI: Failed to Save Logs, ", e);
                tx.oncomplete = () => db.close();
                res(void 0);
            };
        };
    });
}

export function hijackConsole() {
    if (console) {
        console = mbwLogger(console);
    } else if (window && window.console) {
        window.console = mbwLogger(window.console);
    }
}

export async function exportLogs(fromIDB: boolean = false): Promise<string> {
    var userAgent = navigator.userAgent;
    var versionStart = userAgent.indexOf("Safari") + 7;
    var version = userAgent.substring(versionStart);
    console.log("MDL: Browser name and version: Safari", version);

    const settings = await SettingsStore.getInstance().getAllSettings();
    const exclusions = await getExclusionService().getAllExclusions();

    console.debug("MDL: Downloading logs");
    console.log("MDL: User settings: ", JSON.stringify(settings));
    console.log("MDL: Blocked items: ", []);
    console.log("MDL: Allowed items: ", JSON.stringify(exclusions));
    console.log("MDL: Content Control Items: ", []);
    let logs = "";

    try {
        logEnvironmentInfo();
        console.debug("MDL: Getting logs - log local db info");
        await logLocalDbInfo();
        if (fromIDB) {
            console.debug("MDL: Getting logs from IDB");
            logs = await logFromIDB();
            console.debug("MDL: Got logs from IDB");
        } else {
            logs = SESSION_LOG;
            console.debug("MDL: Getting logs from session", logs);
        }
    } catch (_e) {
        console.debug("MDL: Error getting logs", _e);
        // ignore error, just take what we can get
    }

    try {
        console.debug("MDL: Clamp logs");
        const maxSize = fromIDB ? maxLogSize : maxSessionLogSize;
        const fullLog = logs + CONSOLE_TRACE;

        const clampedFullLog =
            fullLog.length > maxSize
                ? fullLog.slice(fullLog.length - maxSize)
                : fullLog;
        return clampedFullLog;
    } catch (error) {
        console.debug("MDL: Error generating logfile", error);
        throw error;
    }
}

export async function loggingReset() {
    clearCachedLogs();        
    CONSOLE_TRACE = "";
    SESSION_LOG = "";
    console.debug('RSE: Cleared cached logs');            
}

async function clearCachedLogs(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!indexedDB || isIncognito()) {
            console.debug("LFI: IndexedDB not available in this browser");
            return resolve();
        }

        const request = indexedDB.deleteDatabase(logStoreName);
        request.onerror = (err) => {
            console.error("CCL: Failed to clear cached logs", err);
            return reject(err);
        };
        request.onsuccess = () => {
            console.debug("CCL: Successfully cleared cached logs");
            return resolve();
        };
    });
}

function logEnvironmentInfo() {
    const env = {
        browser: browserVersion(),
        version: chrome.runtime.getManifest().version,
        build: INTERNAL_VERSION,
        databases: [],
    };
    console.log(`ENV: ${JSON.stringify(env)}`);
}

function logLocalDbInfo(): Promise<void> {
    // TODO: implement
    return Promise.resolve();
}

function logFromIDB(): Promise<string> {
    return new Promise((res) => {
        if (!indexedDB || isIncognito()) {
            console.debug("LFI: IndexedDB not available in this browser");
            return res("");
        }

        const request = indexedDB.open(logStoreName, 1);
        let db;
        let tx;
        let store;
        // this fires on first time database is created
        request.onupgradeneeded = () => {
            db = request.result;
            store = db.createObjectStore(logStoreName, {keyPath: "logs"});
        };

        request.onerror = (e) => {
            console.error("LFI: error opening log IDB: ", e);
            res("");
        };

        request.onsuccess = async () => {
            console.debug("LFI: Succesfully opened IndexDB Cached data store");
            db = request.result;
            tx = db.transaction(logStoreName, "readwrite");
            store = tx.objectStore(logStoreName);

            db.onerror = (e) => {
                console.error("LFI: IndexDB Error: ", e);
                res("");
            };

            const storedLogs = await logGet(store);

            tx.oncomplete = () => db.close();
            res((storedLogs as string) || "");
        };
    });
}
