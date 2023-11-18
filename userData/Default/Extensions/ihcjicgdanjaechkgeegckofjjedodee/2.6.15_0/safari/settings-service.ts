import {SettingsService} from "@/domain/settings-service";
import {SettingsStore} from "@/domain/stores/settings";
import {SettingKey} from "@/domain/types/settings";
import {chrome} from "@/utils/typed-polyfill";

const MSG_SAFARI_GET_VERSION_INFO = "MSG_SAFARI_GET_VERSION_INFO";

export class SafariSettingsService implements SettingsService {
    getSetting(key: SettingKey): Promise<unknown> {
        return SettingsStore.getInstance().getSetting(key);
    }
    
    setSetting(key: SettingKey, value: unknown): Promise<boolean> {
        return SettingsStore.getInstance().setSetting(key, value);
    }

    getExtensionVersion(): Promise<string> {
        console.debug("GEV: Sending request to safari");
        return new Promise((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_SAFARI_GET_VERSION_INFO},
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("GEV: Received error from safari", {
                            error: chrome.runtime.lastError,
                        });
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    console.debug("GEV: Received response from safari", {
                        response,
                        fitst: response[0],
                    });
                    resolve(response[0].version);
                }
            );
        });
    }
}
