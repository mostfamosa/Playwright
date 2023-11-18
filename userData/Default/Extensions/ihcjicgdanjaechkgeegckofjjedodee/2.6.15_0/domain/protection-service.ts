import {browserName} from "@/utils/utils.js";
import type {ExclusionType} from "./types/exclusion";
import type {SettingKey} from "./types/settings";
import {SafariProtectionService} from "@/safari/protection-service";

export interface ProtectionService {
    isProtectionActiveForUrl(
        exclusionType: ExclusionType,
        urlOfTab: string,
        urlOfAd: string,
        tabId?: string
    ): Promise<boolean>;
    isProtectionActive(settingKey: SettingKey): Promise<boolean>;

    toggleAllProtections(enabled: boolean): Promise<boolean>;
    toggleIndividualProtection(
        exclusionType: ExclusionType,
        enabled: boolean
    ): Promise<boolean>;
    toggleIndividualProtectionBySettingKey(
        settingKey: SettingKey,
        enabled: boolean
    ): Promise<boolean>;

    getProtectionStatus(): Promise<Map<ExclusionType | SettingKey, boolean>>;
}

export function getProtectionService(): ProtectionService {
    const browser = browserName();
    if (browser === "Safari") {
        return new SafariProtectionService();
    }

    return new SafariProtectionService();
}
