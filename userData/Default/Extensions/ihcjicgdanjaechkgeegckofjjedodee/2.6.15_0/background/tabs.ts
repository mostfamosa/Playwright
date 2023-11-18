import {BackgroundMessageResponse} from "@/utils/messaging/messaging";
import {domain, urlDomains, urlHost} from "@/utils/utils.js";
import {
    EXCLUSION_INDIVIDUAL,
    SAFE_CACHE,
    TAB_MALWARE_NOTIFIED,
    clearSafeCache,
} from "./definitions";
import {flushLogs} from "./logging";
import {GetTabIdResponse, GetTabInfoResponse} from "@/utils/messaging/types";

const TABS: Record<any, any> = {};

chrome.tabs.onUpdated.addListener(
    (
        tabId: number,
        changeInfo: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab
    ) => {
        if (changeInfo.status === "complete") {
            tabsOnUpdateComplete(tabId);
        } else if (changeInfo.status === "loading") {
            tabsOnUpdateLoading(tabId, changeInfo, tab);
        } else if (changeInfo.status === undefined) {
            // iconRefresh(tabId);
        }
        syncFriendlyUrl(tab);
    }
);

chrome.tabs.onRemoved.addListener(tabsOnRemoved);

chrome.windows.onRemoved.addListener((windowId) => {
    // brute force clear out entire cache when window closed
    clearSafeCache();

    // attempt to save logs
    flushLogs();
});

/**
 * We need to know when a tab was replaced, because chrome invisibly swaps
 * tabs (and corresponding ID's) for the sake of pre-rendering. More here:
 * https://stackoverflow.com/a/23995989/984830
 */
chrome.tabs.onReplaced.addListener((tabIdAdded, tabIdRemoved) => {
    if (!TABS[tabIdAdded]) {
        console.debug(
            "Chrome has swapped tab " +
                tabIdRemoved +
                " for " +
                tabIdAdded +
                " => Replacing in namespace"
        );
        TABS[tabIdAdded] = TABS[tabIdRemoved];
        TABS[tabIdAdded].tabId = tabIdAdded;
        TABS[tabIdRemoved] = null;
    } else {
        console.debug(
            "Chrome has swapped tab " +
                tabIdRemoved +
                " for " +
                tabIdAdded +
                " => Removing unused tab"
        );
        TABS[tabIdRemoved] = null;
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.get(tab.id!, async (tab) => {
        if (!chrome.runtime.lastError) {
            // TODO: fix this
            // let isProtectionEnabled = await malwarebytes.settingsGet("enableProtection");
            // malwarebytes.setBGIcon(tab.id, isProtectionEnabled);
        }
    });
});

export function msgTabDataGet(
    sendResponse: (response?: BackgroundMessageResponse<unknown>) => void,
    tabId: number
) {
    console.debug("Chrome: msgTabDataGet(tabId): ", {tabId, tabs: TABS});
    try {
        let tab = TABS[tabId]; //Note: payload here should be just a tab id
        if (tab) {
            sendResponse({
                success: {
                    host: tab.site.friendlyUrl || tab.site.host,
                    blocked: appendHeuristicAds(tab.site.host, tab.blocked),
                    excluded: EXCLUSION_INDIVIDUAL[tab.site.host] || {},
                },
            });
        } else {
            console.debug("Error: No tab data defined for: " + tabId + "!", {
                tabs: TABS,
            });
            sendResponse({
                error:
                    "Background replied: No tab data defined for: " +
                    tabId +
                    "!",
            });
        }
    } catch (e) {
        sendResponse({
            // @ts-ignore
            error: "Data get failed. Background replied: " + e.message,
        });
    }
    return false;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTabsQueryAPI() {
    return new Promise((res, rej) => {
        if (chrome && chrome.tabs) {
            return res(chrome.tabs.query);
        }

        const maxTries = 5;
        let tries = 0;
        while (tries < maxTries) {
            console.info(
                "getTabsQueryAPI: chrome.tabs not available. Attempting to get it",
                {tries}
            );
            tries++;
            if (chrome && chrome.tabs) {
                console.info(
                    "getTabsQueryAPI: chrome.tabs available. Returning it"
                );
                return res(chrome.tabs.query);
            }
            // sleep
            sleep(300);
        }

        rej("chrome.tabs not available");
    });
}

export function msgTabIdGet(
    sendResponse: (
        response?: BackgroundMessageResponse<GetTabIdResponse>
    ) => void
) {
    getTabsQueryAPI().then((tabsApi) => {
        console.debug("MSG_TAB_ID_GET: tabsApi available ", {tabsApi});        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            console.info("MSG_TAB_ID_GET: tabs.query: ", {tabs});
            sendResponse({
                payload: {
                    tabId: tabs[0].id,
                } as GetTabIdResponse,
            });
        });
    }).catch((e) => {
        console.error("MSG_TAB_ID_GET: error getting tabsApi: ", e);
    });
}

export function msgTabInfoGet(
    sendResponse: (
        response: BackgroundMessageResponse<GetTabInfoResponse>
    ) => void
) {
    getTabsQueryAPI().then((tabsApi) => {
        console.debug("MSG_TAB_INFO_GET: tabsApi available ", {tabsApi});
        // @ts-ignore
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            console.info("MSG_TAB_INFO_GET: tabs.query: ", {
                tabs,
            });
            const resp: BackgroundMessageResponse<GetTabInfoResponse> = {
                payload: {
                    tabId: tabs[0].id,
                    url: tabs[0].url,
                } as GetTabInfoResponse,
            };
            console.info("MSG_TAB_INFO_GET: tabs.query: resp: ", {
                resp,
            });
            sendResponse(resp);
        });
    }).catch((e) => {
        console.error("MSG_TAB_ID_GET: error getting tabsApi: ", e);
    });
}

/**
 * Appends the heuristic-ad-block item to the ads dictionary if necessary,
 * when heuristic-ad-block is individual excluded, no item is added to the tab info upon page refresh
 * avoiding the user turning it back on. This method fixes it.
 * @param {string} host - The URL's hostname
 * @param {Object} blockedItems - The blocked items that will be sent to the popup page
 * @return {Object} updated blockedItems object
 */
function appendHeuristicAds(host: string, blockedItems: {ads: any}) {
    if (!EXCLUSION_INDIVIDUAL[host]) {
        //No individual exclusions for the host, nothing to fix
        return blockedItems;
    }

    if (!EXCLUSION_INDIVIDUAL[host].hasOwnProperty("heuristic-ad-block")) {
        //heuristic-ad-block has not been excluded, nothing to fix
        return blockedItems;
    }

    if (
        blockedItems.ads &&
        blockedItems.ads[host] &&
        blockedItems.ads[host].hasOwnProperty("heuristic-ad-block")
    ) {
        //Already in the object
        return blockedItems;
    }

    if (!blockedItems.ads) {
        blockedItems.ads = {};
    }
    if (!blockedItems.ads[host]) {
        blockedItems.ads[host] = {};
    }
    blockedItems.ads[host]["heuristic-ad-block"] = 0;
    return blockedItems;
}

export function blockPreExistingTabs() {
    return new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => {
            for (const element of tabs) {
                mapTab(element.id!, element.url || element.pendingUrl || '');
            }
            // iconRefreshAll();
            resolve(0);
        });
    });
}

// TODO: used in startup sequence
export function mapTab(tabId: number, url: string) {
    const urlSld = domain(url);
    const domains = urlDomains(url);

    onNewTab(tabId, url, urlSld, domains);

    // const action = malwarebytes.onBeforeTabWebRequest(
    //     {tabId, url, sld: urlSld, domains}
    // );
    // if (action && action.redirectUrl) {
    //     chrome.tabs.update(tabId, {url: action.redirectUrl});
    // }
}

function tabsOnUpdateComplete(tabId: number) {
    //the temp exclusion was only good for the one load
    //NOTE: I've actually decided to keep temporary as long as tab lives - because content-tss needs it, ongoing
    //The page continued loading, good time to sync our DB data with the newly updated CACHE data
    // syncDetectionData();
    // syncAllStatsData();
    // malwarebytes.iconRefresh(tabId);
    keepTabInSync(tabId);
}

function keepTabInSync(tabId: number) {
    if (tabId >= 0 && TABS[tabId]) {
        // Flagging as complete so we do not accidently overwrite before we are are ready
        // See malwarebytes.tabsOnUpdateLoading
        TABS[tabId].status = "complete";
        // Ensure we are in sync
        (chrome.action || chrome.browserAction).getBadgeText(
            {tabId},
            (text) => {
                if (!text) {
                    return;
                }

                const totalBlocked = Object.values(
                    TABS[tabId].blocked.totals
                    // @ts-ignore
                ).reduce((accum: number, cv: number) => accum + cv, 0);

                if (
                    totalBlocked !== Number(text) &&
                    TABS[tabId].blockedHistory
                ) {
                    // revert back to the history because we overwrote it
                    TABS[tabId].blocked = JSON.parse(
                        JSON.stringify(TABS[tabId].blockedHistory)
                    );
                }
            }
        );
    }
}

function tabsOnUpdateLoading(tabId: number, changeInfo: any, tab: chrome.tabs.Tab) {
    if (TABS[tabId] && TABS[tabId].status === "loading") {
        return;
    }

    if (changeInfo.url) {
        if (!changeInfo.url.startsWith("chrome://")) {
            onNewTab(
                tabId,
                changeInfo.url,
                domain(changeInfo.url),
                urlDomains(changeInfo.url)
            );
        }
    } else {
        // Catch when refresh is occuring to reset counters
        onNewTab(tabId, tab.url!, domain(tab.url!), urlDomains(tab.url));
    }
}

function onNewTab(
    tabId: number,
    url: string,
    urlSld: string,
    domains: string[]
) {
    if (tabId >= 0) {
        let blockedHistory;
        if (TABS[tabId] && TABS[tabId].blocked) {
            blockedHistory = JSON.parse(JSON.stringify(TABS[tabId].blocked));
        }
        const current = TABS[tabId];
        TABS[tabId] = {
            tabId: tabId,
            site: {
                url: url,
                host: urlHost(url),
                sld: urlSld,
                domains: domains,
                friendlyUrl:
                    current && current.site && current.site.friendlyUrl,
            },
            status: "loading",
            meta: {
                //If we store these here, then when we switch a switch we need to reset these stored values!
                //    isExcludedAds: malwarebytes.isProtectionActive( Malwarebytes.EXCLUSION_ADS, url, tabId ),
                // isExcludedClickbait: malwarebytes.isExcluded( Malwarebytes.EXCLUSION_CLICKBAIT, url ),
                //    isExcludedMalware: malwarebytes.isProtectionActive( Malwarebytes.EXCLUSION_MALWARE, url, tabId ),
                //    isExcludedScams: malwarebytes.isProtectionActive( Malwarebytes.EXCLUSION_SCAMS, url, tabId ),
                // isExcludedFakeNews: malwarebytes.isExcluded( Malwarebytes.EXCLUSION_FAKE_NEWS, url ),
                //isExcludedTrackers: malwarebytes.isExcluded( Malwarebytes.EXCLUSION_TRACKERS, url ),
                //    isExcludedPups: malwarebytes.isProtectionActive( Malwarebytes.EXCLUSION_PUPS, url, tabId ),
                //    isWhitelistedAds: malwarebytes.isWhitelistedAds( url ),
                history: TABS[tabId] ? TABS[tabId].meta.history : [],
                timestamp: Date.now(),
            },
            blocked: {
                totals: {
                    ads: 0,
                    malware: 0,
                    scams: 0,
                    content: 0,
                },
                ads: {},
                malware: {},
                scams: {},
                content: {},
                //trackers: { }
            },
            blockedHistory,
        };
        TABS[tabId].meta.history = TABS[tabId].meta.history.filter(
            (item: any) => Date.now() - 10000 <= item.timestamp
        );
        TABS[tabId].meta.history.push({
            url: TABS[tabId].site.url,
            timestamp: TABS[tabId].meta.timestamp,
        });
    } else {
        console.debug("Error: tab " + tabId + " less than 0 (Not Adding)");
    }
}

function tabsOnRemoved(tabId: number, info: chrome.tabs.TabRemoveInfo) {
    // regurlarly purge the cache
    if (SAFE_CACHE[tabId]) {
        SAFE_CACHE[tabId] = {...SAFE_CACHE[tabId]};
        delete SAFE_CACHE[tabId];
    }
    // @ts-ignore
    if (TAB_MALWARE_NOTIFIED[tabId]) {
        // @ts-ignore
        delete TAB_MALWARE_NOTIFIED[tabId];
    }
}

function syncFriendlyUrl(tab: chrome.tabs.Tab) {
    if (!tab.id || !tab.url) {
        return;
    }
    if (TABS[tab.id] && TABS[tab.id].site) {
        TABS[tab.id].site.friendlyUrl = urlHost(tab.url);
    }
}
