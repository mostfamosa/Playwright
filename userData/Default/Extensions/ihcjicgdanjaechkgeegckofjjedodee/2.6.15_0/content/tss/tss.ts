import {sendBackgroundMessage} from "@/utils/messaging/messaging";
import {
    MSG_DETECTION,
    MSG_SETTINGS_GET,
    MSG_TAB_ID_GET,
} from "@/app/scripts/app-consts.js";
import {
    DetectionRequest,
    DetectionResponse,
    GetSettingRequest,
    GetSettingResponse,
} from "@/utils/messaging/types";
import {createBlockUrl, isSafari} from "../helpers";
import {injectJavascript, urlHost} from "@/utils/utils.js";
import {
    checkoutRegex,
    latestTssBodyPatterns,
    latestTssTitlePatterns,
} from "@/utils/patterns.js";
import {SETTING_SKIMMER_PROTECTION} from "@/domain/types/settings";
import {
    isCheckoutSkimmer,
    isExcluded,
    isRepeated,
    isSusAudioPlayer,
    isTrojanScam,
} from "./functions";
import {EXCLUSION_SCAMS} from "@/domain/types/exclusion";

/* import { sentryInit } from "@/ui/sentry";
import {escapeRegExp} from "lodash";
import * as Sentry from "@sentry/browser";

sentryInit({
    allowUrls: [new RegExp(escapeRegExp(chrome.runtime.getURL("/")), "i")],
    integrations: [
        new Sentry.Integrations.GlobalHandlers({
            onerror: true,
            onunhandledrejection: false, // This has to be disabled because it keeps capturing promise rejections from the main scripts
        }),
    ],
}); */

var detected = false;
var excluded = false;
var tabId;
var nonce =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
let mbtssUrl = window.location.href;
let lastFullScreenData = {};

function isSuspiciousPage() {
    return isSusAudioPlayer() || isTrojanScam();
}

function onSuspiciousPage() {
    console.debug("TSS: Caught a suspicious page");
    onDetection("scam", "suspiciousPage");
}

async function onDetection(type, subtype) {
    if (!detected && !excluded) {
        const resp = await sendBackgroundMessage<
            DetectionRequest,
            DetectionResponse
        >({
            type: MSG_DETECTION,
            payload: {type: EXCLUSION_SCAMS},
        });
        console.debug(`TSS: Received onDetection message response`, {resp});
        if (resp.payload!.detect) {
            onDetectionImpl(type, subtype);
        } else {
            onExclusion("detection");
        }
    }
}

async function onDetectionImpl(type, subtype) {
    if (isSafari) {
        const isExcl = await isExcluded(urlHost(mbtssUrl), tabId);
        if (isExcl) {
            return;
        }
    }

    console.debug("TSS: Removing suspicious iframes");
    detected = true; // suppress "are you sure you want to leave this page?" popups
    // delete iframes so they can't show the popups either
    document.querySelectorAll("iframe").forEach((element) => {
        element.remove();
    });

    const prevUrl = isSafari ? document.referrer : null;
    const blockUrl = createBlockUrl(
        null,
        mbtssUrl,
        type,
        subtype,
        null,
        null,
        prevUrl
    );
    window.location.replace(blockUrl);
}

function onExclusion(trig) {
    excluded = true;
    if (trig != "send-mesage") {
        window.postMessage({type: "exclude", nonce: nonce}, "*");
    }
}

function onFullScreenChange() {
    console.debug("TSS: Caught suspicious full screen spamming");
    // detect if >= 10 repeated full screen changes within 10 seconds
    console.debug(
        `TSS: Checking if repeated ${10} times for interval ${10000} against data: `,
        lastFullScreenData
    );
    if (isRepeated(lastFullScreenData, 10000, 10)) {
        onDetection("scam", "fullScreenLoop");
    }
}

function onAuthRequired() {
    console.debug(
        "TSS: Caught suspicious auth required - investigating for tech support scam"
    );
    // detect if page looks like a tech support scam
    if (isSuspiciousPage()) {
        onDetection("scam", "authRequiredLoop");
    }
}

function initScriptListener() {
    window.addEventListener(
        "message",
        (event) => {
            if (
                event.source === window &&
                event.data.nonce === nonce &&
                event.data.type === "scam"
            ) {
                onDetection(event.data.type, event.data.subtype);
            }
        },
        false
    );
}

// Skimmer protection bypasses the allowlist due to its prevalence on popular sites
// https://malwarebytes.atlassian.net/browse/BG-1337
function injectSkimmerProtection() {
    console.debug("TSS: Init skimmer protection");
    injectJavascript(`
        setTimeout(() => (devtools = true), 1000);
        window.Firebug = {chrome: {isInitialized: true}};
    `);
}

function setup() {
    initScriptListener();
    window.addEventListener(
        "beforeunload",
        (event) => {
            //TODO: We need to detect and prevent: Navigated to https://www.msn.com/g00/en-us?i10c.ua=1&i10c.encReferrer=&i10c.dv=15
            event.stopImmediatePropagation();
        },
        false
    );

    document.addEventListener("fullscreenchange", onFullScreenChange, false);
    document.addEventListener(
        "webkitfullscreenchange",
        onFullScreenChange,
        false
    );
    document.addEventListener("mozfullscreenchange", onFullScreenChange, false);
    chrome.runtime.onMessage.addListener((message, ignored, ignore) => {
        if (message.type === "authRequired") {
            onAuthRequired();
        }
    });

    //NOTE: JSON.stringify(mbtss) doesn't work, doesnt include methods, only the nonce
    injectJavascript(`
    (function() {
        let nonce = "${nonce}";
        console.debug("TSS: hosted page injected");
        // hook functions
        let detected = false;
        let excluded = false;
        let lastHistoryData = {};
        let lastPrintData = {};
        let lastCreateURLData = {};
        let lastNotificationData = {};
        function setHook({object, f, subtype, detectFunc, proxy = passthru, isBrowserlocker = true}) {
            let originalFunc = object[f];
            object[f] = function() {
                if (detected && !excluded && isBrowserlocker) {
                    // Forces a failure of the original Function
                    throw new Error('Breaking Browser Locker Behavior detected');
                }
                let parameters = [].slice.call(arguments);
                if (!excluded && detectFunc(parameters)) {
                    detected = true;
                }
                if (detected && !excluded) {
                    notify(subtype, parameters);
                }
                if (detected && !excluded && isBrowserlocker) {
                    // Forces a failure of the original Function
                    throw new Error('Breaking Browser Locker Behavior detected');
                }
                return proxy(originalFunc, this, parameters);
            };
        }
        function notify(subtype, parameters) {
            window.top.postMessage(JSON.parse(JSON.stringify({type: 'scam', subtype, parameters, nonce})), "*" );
        }
        function passthru( originalFunc, object, parameters ) {
            return originalFunc.apply( object, parameters );
        }
        // detection logic
        ${isSuspiciousPage.toString()};
        var isRepeatedVar = ${isRepeated.toString()};
        function isRepeated(data, interval, threshold) {
            return isRepeatedVar(data, interval, threshold);
        }
        function onPrint(parameters) {
            console.debug("TSS: Caught print");
            return isRepeated(lastPrintData, 10000, 3);
        }
        function onHistoryPush(parameters) {
            return onHistory(parameters);
        }
        function onHistoryReplace(parameters) {
            console.debug("TSS: Counted history being replaced");
            return onHistory(parameters);
        }
        function onHistory( parameters ) {
            lastHistoryData.lastCount === 499 && console.debug( "TSS: Caught history attemp number: 499" );
            // detect if >= 500 repeated history modifications within 1 second
            return isRepeated( lastHistoryData, 1000, 500 );
        }
        function onWebstore( parameters ) {
            console.debug( "TSS: Caught webstore install" );
            return true;
        }
        function onCreateURL( parameters ) {
            console.debug( "TSS: Caught create URL" );
            // detect if >= 500 repeated URL creations within 1 second
            return isRepeated( lastCreateURLData, 1000, 500 );
        }
        function onInstallXPI( parameters ) {
            console.debug( "TSS: Caught install XPI" );
            return true;
        }
        function onNotification( parameters ) {
            console.debug( "TSS: Caught notification permission request" );
            return isRepeated( lastNotificationData, 5000, 2 );
        }
        // set hooks
        setHook({object: window, f: "print", subtype: "printLoop", detectFunc: onPrint});
        setHook({object: window.history, f: "pushState", subtype: "historyLoop", detectFunc: onHistoryPush});
        window.setTimeout(function() {
            setHook(
                {object: window.history, f: "replaceState", subtype: "historyLoop", detectFunc: onHistoryReplace}
            );
        }, 2000);
        setHook({object: URL, f: "createObjectURL", subtype: "createURLLoop", detectFunc: onCreateURL});
        if (window.chrome && window.chrome.webstore) {
            setHook({
                object: chrome.webstore,
                f: "install",
                subtype: "extensionInstall",
                detectFunc: onWebstore,
                isBrowserlocker: false
            });
        }
        if (window.InstallTrigger) {
            setHook({
                object: window.InstallTrigger,
                f: "install",
                subtype: "extensionInstall",
                detectFunc: onInstallXPI,
                isBrowserlocker: false
            });
        }
        if (window.Notification) {
            setHook({
                object: window.Notification,
                f: "requestPermission",
                subtype: "notificationLoop",
                detectFunc: onNotification,
                isBrowserlocker: false
            });
        }
        // listen for exclusions notifications
        window.addEventListener( "message",
            function( event ) {
                if ( event.source === window && event.data.nonce === nonce ) {
                    if ( event.data.type === "exclude" ) {
                        excluded = true;
                    }
                }
            }, false
        );
    })();
    `);
    // injectJsFile('injection-tss.js', {nonce: mbtss.nonce});

    if (isCheckoutSkimmer()) {
        console.debug("TSS: Caught unsafe checkout");
        onDetection("scam", "suspiciousPage");
    }

    const detectSuspiciousPage = () => {
        if (latestTssTitlePatterns.test(document.head.outerHTML)) {
            console.debug(
                "TSS: Page blocked due to malicious patterns in the head content."
            );
            return onSuspiciousPage();
        }
        const hasSuspiciousPattern = latestTssBodyPatterns.some((element) =>
            document.body.outerHTML.includes(element)
        );
        if (hasSuspiciousPattern) {
            return onSuspiciousPage();
        }
    };

    if (document.readyState !== "loading") {
        detectSuspiciousPage();
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            detectSuspiciousPage();
        });
    }

    setTimeout(() => {
        if (isSuspiciousPage()) {
            onSuspiciousPage();
        }
    }, 1000);
}

export function getTabId() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: MSG_TAB_ID_GET}, function (response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(response.payload.tabId);
            }
        });
    });
}

if (document.readyState !== "loading") {
    onDOMContentLoaded();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        onDOMContentLoaded();
    });
}

async function onDOMContentLoaded() {
    console.debug("TSS: Init");
    getTabId().then(async (id) => {
        console.debug("TSS: Tab id", {id});
        tabId = id;
        const excluded = await isExcluded(urlHost(mbtssUrl), tabId);
        if (excluded) {
            console.debug("TSS: Excluded");
            onExclusion("send-message");
        } else {
            console.debug("TSS: Setup");
            setup();
        }
    });

    if (checkoutRegex.test(window.location.toString())) {
        sendBackgroundMessage<GetSettingRequest, GetSettingResponse>({
            type: MSG_SETTINGS_GET,
            payload: {key: SETTING_SKIMMER_PROTECTION},
        })
            .then((resp) => {
                console.debug("TSS_SKIMMER: skimmer protection response", {resp});
                if (resp.payload && resp.payload.value === true) {
                    injectSkimmerProtection();
                } else {
                    console.debug("TSS_SKIMMER: skimmer protection not enabled", {
                        resp,
                    });
                }
            })
            .catch((err) => {
                console.error("TSS_SKIMMER: skimmer protection error", {err});
            });
    }
}
