import {SafariSettingsService} from "@/safari/settings-service";
import {SettingKey} from "./types/settings";
import {browserName} from "@/utils/utils.js";

export interface SettingsService {
    getSetting(key: SettingKey): Promise<unknown | undefined>;
    setSetting(key: SettingKey, value: unknown): Promise<boolean>;
    getExtensionVersion(): Promise<string>;
}

export function getSettingsService(): SettingsService {
    if (browserName() === "Safari") {
        return new SafariSettingsService();
    }
    return new SafariSettingsService();
}
