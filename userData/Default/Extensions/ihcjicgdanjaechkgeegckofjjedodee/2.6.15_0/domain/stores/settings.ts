import type {SettingKey} from "../types/settings";
import {chrome} from "@/utils/typed-polyfill";
import {loggingReset} from "@/background/logging";
import { simpleStorageGet } from "@/utils/storage.js";

export class SettingsStore {
    private static instance: SettingsStore;

    private cachedSettings: {[key: string]: any} = {};

    private constructor() {
        this.loadSettings();
    }

    public static getInstance(): SettingsStore {
        if (!SettingsStore.instance) {
            SettingsStore.instance = new SettingsStore();
        }
        return SettingsStore.instance;
    }

    private async loadSettings() {
        const allSettings = await simpleStorageGet(null);
        this.cachedSettings = {...this.cachedSettings, ...allSettings};
    }

    async getSetting(key: SettingKey): Promise<unknown | undefined> {
        if (this.cachedSettings[key]) {
            return this.cachedSettings[key];
        }

        try {
            const val = await new Promise((resolve, reject) => {
                chrome.storage.local.get(
                    key,
                    (result: {[key: string]: unknown}) => {
                        if (chrome.runtime.lastError) {
                            console.debug(
                                `Error getting setting ${key}: ${chrome.runtime.lastError}`
                            );
                            resolve(undefined);
                            return;
                        }

                        resolve(result[key]);
                    }
                );
            });

            if (val) {
                this.cachedSettings[key] = val;
            }
            return val;
        } catch (e) {
            console.debug(`Error getting setting ${key}: ${e}`);
            return undefined;
        }
    }

    async setSetting(key: SettingKey, value: unknown): Promise<boolean> {
        const strKey = key as string;
        try {
            this.cachedSettings[strKey] = value;
            // await storageSet({strKey: value});
            return await new Promise((resolve, reject) => {
                chrome.storage.local.set({[strKey]: value}, () => {
                    if (chrome.runtime.lastError) {
                        console.debug(
                            `Error setting setting ${key} to ${value}: ${chrome.runtime.lastError}`
                        );
                        resolve(false);
                        return;
                    }

                    resolve(true);
                });
            });
        } catch (e) {
            console.debug(`Error setting setting ${key} to ${value}: ${e}`);
            return false;
        }
    }

    async getAllSettings(): Promise<{[key: string]: unknown}> {
        return this.cachedSettings;
    }

    async reset(): Promise<void> {
        this.cachedSettings = {};
        chrome.storage.local.clear();
        chrome.storage.sync.clear();        
    }
}
