import {chrome} from "@/utils/typed-polyfill";
import {
    clearLoggedUrls,
    exportLogs,
    hijackConsole,
    loggingReset,
} from "./logging";
import type {
    BackgroundMessageRequest,
    BackgroundMessageResponse,
} from "@/utils/messaging/messaging";
import {
    blockPreExistingTabs,
    msgTabDataGet,
    msgTabIdGet,
    msgTabInfoGet,
} from "./tabs";
import {
    MSG_ADD_ALLOW,
    MSG_ADD_ALLOW_TEMPORARY,
    MSG_DETECTION,
    MSG_DOWNLOAD_LOGS,
    MSG_IS_AD_PROTECTION_ACTIVE,
    MSG_IS_EXCLUDED,
    MSG_LOAD_INLINE_SCRIPT,
    MSG_REM_ALLOW_SINGLE,
    MSG_RESET,
    MSG_SETTINGS_GET,
    MSG_TAB_DATA_GET,
    MSG_TAB_ID_GET,
    MSG_TAB_INFO_GET,
    MSG_TELEMETRY_PHISHING_TUNNEL,
} from "@/app/scripts/app-consts.js";
import {getProtectionService} from "@/domain/protection-service";
import {EXCLUSION_ADS, EXCLUSION_SCAMS} from "@/domain/types/exclusion";
import {
    AddAllowRequest,
    AddAllowResponse,
    AddAllowTemporaryRequest,
    AddAllowTemporaryResponse,
    DetectionRequest,
    DetectionResponse,
    DownloadLogsRequest,
    DownloadLogsResponse,
    GetSettingRequest,
    GetSettingResponse,
    GetTabIdResponse,
    GetTabInfoResponse,
    IsAdProtectionActiveRequest,
    IsAdProtectionActiveResponse,
    IsExcludedRequest,
    IsExcludedResponse,
    LoadInlineScriptRequest,
    RemAllowSingleRequest,
    RemAllowSingleResponse,
    TelemetryPhishingTunnelRequest,
} from "@/utils/messaging/types";
import {getExclusionService} from "@/domain/exclusion-service";
import {urlDomains, urlHost} from "@/utils/utils.js";
import {telemetryMalware} from "@/utils/telemetry.js";
import {SettingsStore} from "@/domain/stores/settings";
import {
    SETTING_SKIMMER_PROTECTION,
    SETTING_TELEMETRY_CONSENT,
    SETTING_VERBOSE_LOGGING,
    SettingKey,
} from "@/domain/types/settings";

// imports for side effects
import "./tabs";
import {getSafariNativeLogs} from "@/safari/logs";
import {safariReset} from "@/safari/misc";
import {getSettingsService} from "@/domain/settings-service";
import {isSafari} from "@/content/helpers";

async function init() {
    initDatabases();
    await SettingsStore.getInstance().setSetting(SETTING_VERBOSE_LOGGING, true);
    await SettingsStore.getInstance().setSetting(
        SETTING_TELEMETRY_CONSENT,
        true
    );
    const verboseLogging = await SettingsStore.getInstance();
    console.debug("BKG: verboseLogging: ", verboseLogging);
    // find tabs that were active before the etension was installed and block if needed
    await blockPreExistingTabs();
}

async function initDatabases() {
    // TODO: implement to support feature flags
}

chrome.runtime.onMessage.addListener(
    (
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: BackgroundMessageResponse<unknown>) => void
    ) => {
        const message = request as BackgroundMessageRequest<unknown>;
        switch (message.type) {
            case MSG_TAB_ID_GET:
                msgTabIdGet(sendResponse);
                return true;
            case MSG_TAB_DATA_GET:
                msgTabDataGet(sendResponse, message.payload as number);
                return false;
            case MSG_TAB_INFO_GET:
                msgTabInfoGet(sendResponse);
                return true;
            case MSG_IS_AD_PROTECTION_ACTIVE:
                msgIsAdProtectionActive(request, sendResponse);
                return true;
            case MSG_ADD_ALLOW_TEMPORARY:
                msgAddAllowTemporary(request, sendResponse);
                return true;
            case MSG_ADD_ALLOW:
                msgAddAllow(request, sendResponse);
                return true;
            case MSG_REM_ALLOW_SINGLE:
                msgRemAllowSingle(request, sendResponse);
                return true;
            case MSG_IS_EXCLUDED:
                msgIsExcluded(request, sender, sendResponse);
                return true;
            case MSG_DETECTION:
                sendResponse({
                    payload: {
                        detect:
                            (message.payload as DetectionRequest).type ===
                            EXCLUSION_SCAMS,
                    } as DetectionResponse,
                });
                return true;
            case MSG_TELEMETRY_PHISHING_TUNNEL:
                msgTelemetryPhishingTunnel(request, sendResponse);
                return true;
            case MSG_DOWNLOAD_LOGS:
                msgDownloadLogs(request, sendResponse);
                return true;
            case MSG_SETTINGS_GET:
                msgSettingsGet(request, sendResponse);
                return true;
            case MSG_RESET:
                msgReset();
                return true;
            case MSG_LOAD_INLINE_SCRIPT:
                msgLoadInlineScript(request, sendResponse);
                return true;                
        }
    }
);

async function msgLoadInlineScript(request: BackgroundMessageRequest<LoadInlineScriptRequest>, sendResponse: (response?: BackgroundMessageResponse<boolean>) => void) {
    chrome.tabs.executeScript(request.payload!.tabId, {
        code: request.payload!.source
    });
    sendResponse({payload: true});
}

async function msgIsAdProtectionActive(
    request: BackgroundMessageRequest<IsAdProtectionActiveRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<IsAdProtectionActiveResponse>
    ) => void
) {
    const protectionStatus = await getProtectionService().getProtectionStatus();
    const adsProtectionEnabled = protectionStatus.get(EXCLUSION_ADS) ?? false;
    if (!adsProtectionEnabled) {
        console.debug("BKG: isAdProtectionActive: adsProtectionEnabled: ", {
            request,
            adsProtectionEnabled,
        });
        sendResponse({payload: {active: false}});
        return;
    }

    const domains = urlDomains(request.payload!.domain);
    console.debug("BKG: isAdProtectionActive: domains: ", {request, domains});
    const results = await Promise.all(
        domains.map((domain) =>
            getExclusionService().isDomainExcluded(domain, EXCLUSION_ADS)
        )
    );
    const isExcluded = results.some((result) => result);
    const payload = {active: !isExcluded};
    console.debug("BKG: isAdProtectionActive: isExcluded: ", {
        request,
        isExcluded,
        payload,
    });
    sendResponse({payload});
}

async function msgAddAllowTemporary(
    request: BackgroundMessageRequest<AddAllowTemporaryRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<AddAllowTemporaryResponse>
    ) => void
) {
    if (request.payload!.domain) {
        await getExclusionService().excludeTemporarily(
            request.payload!.domain,
            request.payload!.tabId
        );
        console.log(
            "Temporary exclusion set up for " +
                request.payload!.domain +
                " (tab " +
                request.payload!.tabId +
                " initiated this)"
        );
        sendResponse({payload: {success: true}});
    } else {
        console.error("No domain provided to addAllowTemporary");
        sendResponse({payload: {success: false}, error: "No domain provided"});
    }
}

async function msgAddAllow(
    request: BackgroundMessageRequest<AddAllowRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<AddAllowResponse>
    ) => void
) {
    const exclusions = request.payload!.exclusions;
    const exclusionService = getExclusionService();
    const ok = await exclusionService.exclude(
        request.payload!.domain,
        exclusions
    );
    if (ok) {
        sendResponse({payload: {success: true}});
        console.debug(`MAAL: Added exclusion `, {
            exclusions,
            domain: request.payload!.domain,
            ok,
        });
    } else {
        sendResponse({payload: {success: false}});
        console.error(`MAAL: Failed to add exclusion `, {
            exclusions,
            domain: request.payload!.domain,
            ok,
        });
    }
}

async function msgRemAllowSingle(
    request: BackgroundMessageRequest<RemAllowSingleRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<RemAllowSingleResponse>
    ) => void
) {
    if (!request.payload) {
        console.error("No payload provided to remAllowSingle");
        sendResponse({payload: {removed: false}, error: "No payload provided"});
        return;
    }

    try {
        const ok = await getExclusionService().removeExclude(
            request.payload.domain,
            request.payload.exclusions,
            request.payload!.override!
        );
        clearLoggedUrls();
        console.debug("MRAS: Resolving RemAllow Single Message: ", {ok});
        sendResponse({payload: {removed: ok}});
    } catch (err) {
        console.error("MRAS: Rejecting RemAllow Single Message: ", {err});
        // @ts-ignore
        sendResponse({error: err});
    }
}

async function msgIsExcluded(
    request: BackgroundMessageRequest<IsExcludedRequest>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (
        response?: BackgroundMessageResponse<IsExcludedResponse>
    ) => void
) {
    console.debug("BKG: Checking is-TSS-Excluded for ", request);
    if (request.payload!.type !== EXCLUSION_SCAMS) {
        sendResponse({payload: {excluded: false}});
        return;
    }

    const urlOrDomain = sender.tab!.url;
    const tabId = request.payload!.tabId;
    if (urlOrDomain && tabId) {
        console.debug("CHECKING isExcludedTemporarily for tab ", tabId);
        const isExcludedTemporarily =
            await getExclusionService().isTemporarilyExcluded(
                urlOrDomain,
                tabId
            );
        if (isExcludedTemporarily) {
            console.debug("isExcludedTemporarily is true for tab ", tabId);
            sendResponse({payload: {excluded: true}});
            return;
        }

        const protectionStatus =
            await getProtectionService().getProtectionStatus();
        const isExcluded = await getExclusionService().isDomainExcluded(
            urlHost(urlOrDomain),
            EXCLUSION_SCAMS
        );
        const scamsProtectionEnabled =
            protectionStatus.get(EXCLUSION_SCAMS) ?? false;
        const response = {
            payload: {excluded: scamsProtectionEnabled && isExcluded},
        };
        sendResponse(response);
        console.debug("BKG: isExcluded response: ", response);
    }
}

async function msgTelemetryPhishingTunnel(
    request: BackgroundMessageRequest<TelemetryPhishingTunnelRequest>,
    sendResponse: (response?: BackgroundMessageResponse<boolean>) => void
) {
    const sendTelemetry = await SettingsStore.getInstance().getSetting(
        SETTING_TELEMETRY_CONSENT
    );
    if (sendTelemetry !== true) {
        console.debug(
            "BKG: msgTelemetryPhishingTunnel: telemetry not consented"
        );
        sendResponse({payload: false});
        return;
    }

    const url = request.payload!.url;
    telemetryMalware("phishing", "tunnel", url, url, [], "");
    sendResponse({payload: true});
}

async function msgDownloadLogs(
    request: BackgroundMessageRequest<DownloadLogsRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<DownloadLogsResponse>
    ) => void
) {
    try {
        console.debug("msgDownloadLogs: Downloading logs: ", request);
        const data = await exportLogs(request.payload!.fullLog);
        console.debug("msgDownloadLogs: Exported logs: ", {
            len: data.length,
            dataExcerpt: data.slice(0, 100),
        });
        const safariNativeLogs = await getSafariNativeLogs();
        console.debug("msgDownloadLogs: Safari native logs: ", {
            len: safariNativeLogs.length,
            safariNativeLogsExcerpt: safariNativeLogs.slice(0, 100),
        });
        const combinedLogs =
            data +
            "\n" +
            "===================================" +
            "\n" +
            "===========NATIVE LOGS=============" +
            "\n" +
            "===================================" +
            "\n" +
            safariNativeLogs.join("\n");
        sendResponse({payload: {success: true, data: combinedLogs}});
    } catch (e) {
        console.error("msgDownloadLogs: Failed to export logs: ", e);
        // @ts-ignore
        sendResponse({error: e.message});
    }
}

async function msgSettingsGet(
    request: BackgroundMessageRequest<GetSettingRequest>,
    sendResponse: (
        response?: BackgroundMessageResponse<GetSettingResponse>
    ) => void
) {
    if (isSafari && request.payload!.key === SETTING_SKIMMER_PROTECTION) {
        const protectionStatus =
            await getProtectionService().getProtectionStatus();
        const skimmerProtectionEnabled =
            protectionStatus.get(SETTING_SKIMMER_PROTECTION) ?? false;
        sendResponse({payload: {value: skimmerProtectionEnabled}});
        return;
    }

    console.debug("BKG: msgSettingsGet: ", {request});
    const key = request.payload!.key;
    const val = await SettingsStore.getInstance().getSetting(key);
    sendResponse({payload: {value: val}});
}

async function msgReset() {
    console.debug("BKG: msgReset: ");
    SettingsStore.getInstance().reset();
    await loggingReset();
    await safariReset();
    chrome.runtime.reload();
}

(function () {
    // hijack the console so we can save the logs
    hijackConsole();
})();

init();
