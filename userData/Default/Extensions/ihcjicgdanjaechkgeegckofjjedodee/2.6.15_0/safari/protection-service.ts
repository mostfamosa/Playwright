import {ProtectionService} from "@/domain/protection-service";
import {
    EXCLUSION_ADS,
    EXCLUSION_MALWARE,
    EXCLUSION_SCAMS,
    ExclusionType,
} from "@/domain/types/exclusion";
import {
    SETTING_GTLD,
    SETTING_SKIMMER_PROTECTION,
    SettingKey,
} from "@/domain/types/settings";
import {chrome} from "@/utils/typed-polyfill";
import {contentBlockerExclusionMap, exclusionContentBlockerMap} from "./common";
import {
    exclusionTypeToSettingKey,
    settingKeyToExclusionType,
} from "@/domain/types/functions";

const MSG_TOGGLE_PROTECTION = "MSG_TOGGLE_PROTECTION";
const MSG_TOGGLE_PROTECTION_LAYER = "MSG_TOGGLE_PROTECTION_LAYER";
const MSG_TOGGLE_SKIMMER_PROTECTION = "MSG_TOGGLE_SKIMMER_PROTECTION";
const MSG_TOGGLE_GTLD_PROTECTION = "MSG_TOGGLE_GTLD_PROTECTION";
const MSG_PROTECTION_STATUS = "MSG_PROTECTION_STATUS";

export class SafariProtectionService implements ProtectionService {
    async isProtectionActiveForUrl(
        exclusionType: ExclusionType,
        urlOfTab: string,
        urlOfAd: string,
        tabId?: string
    ): Promise<boolean> {
        const protections = await this.getProtectionStatus();
        return protections.get(exclusionType) ?? false;
    }

    isProtectionActive(settingKey: SettingKey): Promise<boolean> {
        const exclusionType = settingKeyToExclusionType(settingKey);
        return this.isProtectionActiveForUrl(exclusionType, "", "");
    }

    toggleAllProtections(enabled: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_TOGGLE_PROTECTION, payload: enabled},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    console.debug(
                        "TAP: Received response from safari" +
                            JSON.stringify(response)
                    );
                    resolve(!!response);
                }
            );
        });
    }

    toggleIndividualProtection(
        exclusionType: ExclusionType,
        enabled: boolean
    ): Promise<boolean> {
        const contentBlockerName = exclusionContentBlockerMap[exclusionType];
        const payload = `${enabled}:${contentBlockerName}`;
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_TOGGLE_PROTECTION_LAYER, payload: payload},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    console.debug(
                        "TIP: Received response from safari" +
                            JSON.stringify(response)
                    );
                    resolve(!!response);
                }
            );
        });
    }

    toggleIndividualProtectionBySettingKey(
        settingKey: SettingKey,
        enabled: boolean
    ): Promise<boolean> {
        if (settingKey === SETTING_GTLD) {
            return this.toggleGtldProtection(enabled);
        }

        if (settingKey === SETTING_SKIMMER_PROTECTION) {
            return this.toggleSkimmerProtection(enabled);
        }

        const exclusionType = settingKeyToExclusionType(settingKey);
        return this.toggleIndividualProtection(exclusionType, enabled);
    }

    getProtectionStatus(): Promise<Map<ExclusionType | SettingKey, boolean>> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_PROTECTION_STATUS},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    console.debug("GPStat: Received response from safari", {
                        response: JSON.parse(response[0]),
                    });
                    const {
                        adsProtectionEnabled,
                        malwareProtectionEnabled,
                        scamsProtectionEnabled,
                        gtldProtectionEnabled,
                        skimmerProtectionEnabled,
                    } = JSON.parse(response[0]);

                    return resolve(
                        new Map([
                            [EXCLUSION_ADS, adsProtectionEnabled],
                            [EXCLUSION_MALWARE, malwareProtectionEnabled],
                            [EXCLUSION_SCAMS, scamsProtectionEnabled],
                            [SETTING_GTLD, gtldProtectionEnabled],
                            [
                                SETTING_SKIMMER_PROTECTION,
                                skimmerProtectionEnabled,
                            ],
                        ])
                    );
                }
            );
        });
    }

    private toggleSkimmerProtection(enabled: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_TOGGLE_SKIMMER_PROTECTION, payload: enabled},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    console.debug("TSP: Received response from safari", {
                        response: JSON.parse(response),
                    });
                    resolve(response);
                }
            );
        });
    }

    private toggleGtldProtection(enabled: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_TOGGLE_GTLD_PROTECTION, payload: enabled},
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }

                    console.debug("TSP: Received response from safari", {
                        response: JSON.parse(response),
                    });
                    resolve(response);
                }
            );
        });
    }
}
