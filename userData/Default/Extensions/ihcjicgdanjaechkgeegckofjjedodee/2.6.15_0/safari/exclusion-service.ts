import {EXCLUSION_MALWARE, EXCLUSION_SCAMS} from "@/app/scripts/app-consts";
import type {ExclusionService} from "@/domain/exclusion-service";
import {
    ExclusionType,
    Exclusion,
    EXCLUSION_ADS,
} from "@/domain/types/exclusion";
import {chrome} from "@/utils/typed-polyfill";
import {contentBlockerExclusionMap, exclusionContentBlockerMap} from "./common";
import {urlHost} from "@/utils/utils.js";

const MSG_SAFARI_ALLOW_LIST_FETCH = "MSG_SAFARI_ALLOW_LIST_FETCH";
const MSG_SAFARI_ALLOW_LIST_ADD = "MSG_SAFARI_ALLOW_LIST_ADD";
const MSG_SAFARI_ALLOW_LIST_REMOVE = "MSG_SAFARI_ALLOW_LIST_REMOVE";
const MSG_SAFARI_ALLOW_LIST_EXISTS = "MSG_SAFARI_ALLOW_LIST_EXISTS";
const MSG_SAFARI_ALLOW_LIST_CLEAR = "MSG_SAFARI_ALLOW_LIST_CLEAR";
const MSG_SAFARI_ALLOW_LIST_IS_EXCLUDED = "MSG_SAFARI_ALLOW_LIST_IS_EXCLUDED";

export class SafariExclusionService implements ExclusionService {
    
    private static instance: SafariExclusionService;

    EXCLUSION_TEMPORARY = {};

    private constructor() {
        this.EXCLUSION_TEMPORARY = {};
    }

    public static getInstane(): SafariExclusionService {
        if (!SafariExclusionService.instance) {
            SafariExclusionService.instance = new SafariExclusionService();
        }
        return SafariExclusionService.instance;
    }

    exclude(host: string, exclusions: ExclusionType[]): Promise<boolean> {
        const contentBlockerNames = exclusions
            .map((exclusion) => exclusionContentBlockerMap[exclusion])
            .join(",");
        const payload = `${host}:${contentBlockerNames}`;
        console.debug("addToAllowList payload: ", payload);
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_SAFARI_ALLOW_LIST_ADD, payload},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    const resp = JSON.parse(response);
                    console.debug("ExclusionService.exclude: Received response from safari" + resp);
                    resolve(resp);
                }
            );
        });
    }

    getAllExclusions(): Promise<Exclusion[]> {
        return new Promise<Exclusion[]>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_SAFARI_ALLOW_LIST_FETCH},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    const allowListResp = response[0];
                    console.log("ExclusionService.getAllExclusions: Response from native: ", response[0]);
                    const exclusions: Exclusion[] = [];
                    for (const [key, value] of Object.entries(allowListResp)) {
                        exclusions.push({
                            website: key,
                            exclusions: (value as any[]).map(
                                (exclusion: string) => {
                                    return contentBlockerExclusionMap[
                                        exclusion
                                    ];
                                }
                            ),
                        });
                    }
                    resolve(exclusions);
                }
            );
        });
    }

    async getExclusionsForHost(host: string): Promise<Exclusion | undefined> {
        // TODO: This is a hack. We should be able to query the allow list for a specific host over the native messaging API.
        const allExclusions = await this.getAllExclusions();
        const res = allExclusions.find(
            (exclusion) => exclusion.website === host
        );
        console.debug("ExclusionService.getExclusionsForHost: allExclusions: ", {allExclusions, res, host});
        return res;
    }

    isDomainExcluded(host: string, exclusion: ExclusionType): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {
                    action: MSG_SAFARI_ALLOW_LIST_IS_EXCLUDED,
                    payload: `${host}:${exclusionContentBlockerMap[exclusion]}`,
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    const resp = JSON.parse(response);
                    console.debug("ExclusionService.isDomainExcluded: Received response from safari", resp);
                    resolve(resp);
                }
            );
        });
    }

    getExclusions_getExclusionsByNames(
        hostnames: string[]
    ): Promise<Exclusion[]> {
        throw new Error("Method not implemented.");
    }

    removeAllExclusions(): Promise<boolean> {
        return new Promise((resolve) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_SAFARI_ALLOW_LIST_CLEAR},
                (response) => {
                    const resp = JSON.parse(response);
                    console.debug("DAL: Received response from safari", resp);
                    resolve(resp);
                }
            );
        });
    }

    removeExclude(
        host: string,
        exclusions: ExclusionType[],
        addOverride: boolean
    ): Promise<boolean> {
        const contentBlockerNames = exclusions
            .map((exclusion) => exclusionContentBlockerMap[exclusion])
            .join(",");
        const payload = `${host}:${contentBlockerNames}`;
        console.debug("removeFromAllowList payload: ", payload);
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {
                    action: MSG_SAFARI_ALLOW_LIST_REMOVE,
                    payload: payload,
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    const resp = JSON.parse(response);
                    console.debug("RAL: Received response from safari", resp);
                    resolve(resp);
                }
            );
        });
    }

    removeExclusions(host: string): Promise<boolean> {
        return this.removeExclude(host, [], false);
    }

    excludeTemporarily(host: string, tabId: number): Promise<void> {
        console.debug("EXCLUSION_SERVICE: excludeTemporarily", {host, tabId, all: this.EXCLUSION_TEMPORARY});
        this.EXCLUSION_TEMPORARY = {
            host,
            tab: tabId,
        };
        return Promise.resolve();
    }

    async isTemporarilyExcluded(url: string, tabId: number): Promise<boolean> {
        console.debug("EXCLUSION_SERVICE: isTemporarilyExcluded", {host: url, tabId, all: this.EXCLUSION_TEMPORARY});
        if (tabId) {
            if (this.EXCLUSION_TEMPORARY && url) {
                let hostess = urlHost(url);
                // @ts-ignore
                if (this.EXCLUSION_TEMPORARY.host === hostess || this.EXCLUSION_TEMPORARY.host === url) {
                    // @ts-ignore
                    if (tabId === this.EXCLUSION_TEMPORARY.tab) {
                        console.debug('EXCLUSION_SERVICE: isTemporarilyExcluded: returning true');
                        return true;
                    } else {
                        console.debug(
                            hostess +
                                " is temporarily excluded for tab " +
                                // @ts-ignore
                                this.EXCLUSION_TEMPORARY.tab +
                                ", but not not for this tab " +
                                tabId
                        );
                    }
                }
            }
        } else {
            console.debug(
                "No optional tabId specified for exclusionsMatchSync. Skipping isExcludedTemporary check"
            );
        }
        return false;
    }
}
