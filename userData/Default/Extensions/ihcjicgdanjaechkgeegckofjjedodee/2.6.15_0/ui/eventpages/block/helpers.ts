import {
    MSG_ADD_ALLOW,
    MSG_ADD_ALLOW_TEMPORARY,
    MSG_REM_ALLOW_SINGLE,
} from "@/app/scripts/app-consts.js";
import {getTabId} from "@/content/helpers";
import {
    EXCLUSION_ADS,
    EXCLUSION_MALWARE,
    EXCLUSION_SCAMS,
    ExclusionType,
} from "@/domain/types/exclusion";
import {sendBackgroundMessage} from "@/utils/messaging/messaging";
import {
    AddAllowRequest,
    AddAllowResponse,
    AddAllowTemporaryRequest,
    AddAllowTemporaryResponse,
    RemAllowSingleRequest,
    RemAllowSingleResponse,
} from "@/utils/messaging/types";
import {urlExt} from "@/utils/utils.js";
import {chrome} from "@/utils/typed-polyfill";

export function templateParameters() {
    let params: Record<any, any> = {};
    let searchParams = new URLSearchParams(window.location.search);
    // @ts-ignore
    for (let pair of searchParams) {        
        if (pair[1] === "null") {
            params[pair[0]] = null;
        } else if (pair[1] === "undefined") {
            params[pair[0]] = undefined;
        } else {
            params[pair[0]] = pair[1];
        }
    }
    return params;
}

export function typesAsPlural(type: string) {
    switch (type) {
        case "malware":
        case "ads":
            return type;
        case "scam":
        case "ad":
            return `${type}s`;
        default:
            return type;
    }
}

export function redirect(url: string, params: Record<any, any>) {
    const pageExtension = urlExt(url);
    const redirectionPage =
        !!pageExtension && !!params.referrer
            ? `http://${params.referrer.split(/^https?:\/\//)[1]}`
            : `http://${params.url.split(/^https?:\/\//)[1]}`;
    console.debug(
        "Add exclusions was successful. Will redirect to: ",
        redirectionPage
    );
    // NOTE: http is forced because Windows Chrome has a bug where it can pass down
    //       https when that is not the case. Atttempting to navigate to https when there is no https with JS breaks.
    window.location.href = redirectionPage;
}

export function getExclusionConst(type: string, params: any): ExclusionType {
    switch (type) {
        case "malware":
            return EXCLUSION_MALWARE;
        case "scam":
            return EXCLUSION_SCAMS;
        case "ad":
        case "ads":
            return EXCLUSION_ADS;
        default:            
            console.error(
                "The block page exclusion checkbox has not handled '" +
                    params.type +
                    "'"
            );
            throw new Error("Invalid type passed to getExclusionConst");
    }
}

export async function updateAllowListViaMessage(
    params: any,
    exclusionConst: ExclusionType,
    continueAlways: boolean
) {
    if (exclusionConst) {
        let toAllow =
            ["full-url-malware", "malware-pattern"].includes(params.subtype) ||
            params.rules === "specific"
                ? params.url
                : params.host;
        if (continueAlways) {
            //EXCLUDE FROM SCANS
            console.debug(
                "Checkbox switched on - requesting allow for " + exclusionConst
            );
            const resp = await sendBackgroundMessage<
                AddAllowRequest,
                AddAllowResponse
            >({
                type: MSG_ADD_ALLOW,
                payload: {domain: toAllow, exclusions: [exclusionConst]},
            });
            if (!resp || resp.error) {
                console.error(resp ? resp.error : "NO RESPONSE!");
            } else {
                redirect(params.url, params);
            }
        } else {
            //INCLUDE IN SCANS - IT MAY BE POSSIBLE TO GET HERE BY CLICKING QUICKLY BEFORE REDIRECT
            console.debug(
                "Checkbox switched off - requesting block for " + exclusionConst
            );

            const resp = await sendBackgroundMessage<
                RemAllowSingleRequest,
                RemAllowSingleResponse
            >({
                type: MSG_REM_ALLOW_SINGLE,
                payload: {domain: toAllow, exclusions: [exclusionConst]},
            });
            if (!resp || resp.error) {
                console.error(resp ? resp.error : "NO RESPONSE!");
            }

            console.debug("Remove exclusions was successful");
        }
    }
}

export async function excludeTemporary(
    exclusionConst: ExclusionType,
    params: any,
    continueAlways: boolean
) {
    if (continueAlways) {
        //DO nothing if checkbox is checked, assume the exclusion was already handled
        //window.location = params.url;
    } else {
        const tabId = await getTabId();
        const response = await sendBackgroundMessage<
            AddAllowTemporaryRequest,
            AddAllowTemporaryResponse
        >({
            type: MSG_ADD_ALLOW_TEMPORARY,
            payload: {
                domain: params.url || params.host,
                tabId: tabId as number,
            },
        });
        if (response.error) {
            console.error(response.error);
            return;
        }

        console.debug("Add exclusions was successful");
        redirect(params.url, params);

        // new Promise((resolve) => {
        //     if (params.tabId !== null) {
        //         resolve(params.tabId);
        //     } else {
        //         chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        //             resolve(tabs[0].id);
        //         });
        //     }
        // })
        // .then((tabId) => {
        //     const response = await sendBackgroundMessage<AddAllowTemporaryRequest, AddAllowTemporaryResponse>({
        //         type: MSG_ADD_ALLOW_TEMPORARY,
        //         payload: {
        //             domain: params.url || params.host,
        //             tabId: tabId as number,
        //         },
        //     })
        // chrome.runtime.sendMessage({
        //     type: MSG_ADD_ALLOW_TEMPORARY,
        //     host: params.url || params.host,
        //     initiator: tabId,
        //     exclusion: exclusionConst
        // }, function(response) {
        //     if (!response || response.error) {
        //         return Promise.reject(response ? response.error : null);
        //     } else {
        //         return Promise.resolve(response.success);
        //     }
        // });
        // }).then(() => {
        //     redirect(params.url, params);
        // }).catch((err) => {
        //     console.error(err);
        // });
        // return false;
    }
}

export function getExplanationText(params: any) {
    switch (params.subtype) {
        case "adware":
            return chrome.i18n.getMessage("blockExplainAdware");
        case "compromised":
            return chrome.i18n.getMessage("blockExplainCompromised");
        case "exploit":
            return chrome.i18n.getMessage("blockExplainExploit");
        case "fraud":
            return chrome.i18n.getMessage("blockExplainFradulent");
        case "hijack":
            return chrome.i18n.getMessage("blockExplainHijack");
        case "malvertising":
            return chrome.i18n.getMessage("blockExplainMalvertising");
        case "malware":
            return chrome.i18n.getMessage("blockExplainMalware");
        case "pharma":
            return chrome.i18n.getMessage("blockExplainPharma");
        case "phishing":
            return chrome.i18n.getMessage("blockExplainPhishing");
        case "ransomware":
            return chrome.i18n.getMessage("blockExplainRansomware");
        case "reputation":
            return chrome.i18n.getMessage("blockExplainReputation");
        case "riskware":
            return chrome.i18n.getMessage("blockExplainRiskware");
        case "scam":
            return chrome.i18n.getMessage("blockExplainScam");
        case "spam":
            return chrome.i18n.getMessage("blockExplainSpam");
        case "spyware":
            return chrome.i18n.getMessage("blockExplainSpyware");
        case "trojan":
            return chrome.i18n.getMessage("blockExplainTrojan");
        case "worm":
            return chrome.i18n.getMessage("blockExplainWorm");
        default:
            return chrome.i18n.getMessage("blockExplainDefault");
    }
}

export function humanReadableSubType (params: any) {
    if (params.subtype) {
        if (params.subtype === "full-url-malware") {
            return "malware";
        } else if (params.subtype === "suspiciousPage") {
            return chrome.i18n.getMessage("humanReadableSubTypeSuspiciousPage");
        } else if (params.subtype === "suspiciousTLD") {
            return chrome.i18n.getMessage("humanReadableSubTypeSuspiciousTLD");
        } else if (params.subtype === "suspiciousDownload") {
            return chrome.i18n.getMessage("humanReadableSubTypeSuspiciousDownload");
        } else if (params.subtype === "suspiciousContent") {
            return chrome.i18n.getMessage("humanReadableSubTypeSuspiciousContent");
        } else if (params.subtype === "malware-pattern") {
            return chrome.i18n.getMessage("humanReadableSubTypeMalwarePattern");
        } else if (params.subtype === "alertLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeAlertLoop");
        } else if (params.subtype === "authRequiredLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeAuthRequiredLoop");
        } else if (params.subtype === "createURLLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeCreateURLLoop");
        } else if (params.subtype === "extensionInstall") {
            return chrome.i18n.getMessage("humanReadableSubTypeExtensionInstall");
        } else if (params.subtype === "fullScreenLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeFullScreenLoop");
        } else if (params.subtype === "historyLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeHistoryLoop");
        } else if (params.subtype === "notificationLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypeNotificationLoop");
        } else if (params.subtype === "printLoop") {
            return chrome.i18n.getMessage("humanReadableSubTypePrintLoop");
        }
        return params.subtype;
    } else {
        return params.type;
    }
};
