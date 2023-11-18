import {UpdaterProgressHooks, UpdaterService} from "@/domain/updater-service";
import {chrome} from "@/utils/typed-polyfill";

const MSG_SAFARI_DATABASE_UPDATE = "MSG_SAFARI_DATABASE_UPDATE";

export class SafariUpdaterService implements UpdaterService {
    private updatedProtections: Record<string, boolean> = {
        "com.malwarebytes.browserguard.extcbads": false,
        "com.malwarebytes.browserguard.extcbmalware": false,
        "com.malwarebytes.browserguard.extcbpup": false,
        "com.malwarebytes.browserguard.extcbscam": false,
    };

    private progressHooks: UpdaterProgressHooks | null = null;
    private updateMessageQueue: string[] = [];

    async update(progressHooks: UpdaterProgressHooks): Promise<void> {
        this.progressHooks = progressHooks;
        this.handleProgressUpdates();
        this.startUpdate();
    }

    private handleProgressUpdates() {
        console.debug(`CUBL: handleProgressUpdates`);
        new Promise((res) => {
            const interval = setInterval(() => {
                if (this.updateMessageQueue.length > 0) {
                    const message = this.updateMessageQueue.shift();
                    if (message === 'update_start') {
                        this.progressHooks?.onUpdateStart();
                    } else if (message === 'update_progress') {
                        this.progressHooks?.onDownloadComplete();
                    } else if (message === 'update_success') {
                        this.progressHooks?.onSuccess();
                        clearInterval(interval);
                        res(null);
                    }
                }
            }, 300);
        }).then();
    }

    private async startUpdate() {
        console.debug(`CUBL: startUpdate`);
        this.resetUpdatedProtections();
        // TODO
        // sendUpdateFeatureFlagsMessage(); // no need to wait for this
        const response = await this.sendUpdateMessage();
        this.updateMessageQueue.push('update_start');
        // this.progressHooks?.onUpdateStart();
        if (response) {
            let port = chrome.runtime.connectNative("");            
            port.onMessage.addListener((message) => {
                if (message.name === "SAFARI_DATABASE_UPDATE_ERROR") {
                    this.progressHooks?.onUpdateError();
                    port.disconnect();
                } else if (message.name === "SAFARI_DATABASE_UPDATE") {
                    console.debug(`CUBL: Update message received: `, {message});
                    const state = message.userInfo.state;
                    if (state === "searchingUpdates") {
                        this.updateMessageQueue.push('update_start');
                        // this.progressHooks?.onUpdateStart();
                    } else if (state === "updateFailed") {
                        console.debug(`CUBL: Update failed`, {message});
                        this.progressHooks?.onUpdateError();
                    } else if (state === "downloadComplete") {
                        console.debug(`CUBL: Download cb file for`, {
                            message,
                        });
                        const data = message.userInfo.data;
                        this.updatedProtections[data] = true;
                        this.updateMessageQueue.push('update_progress');
                    } else if (state === "updateComplete") {
                        console.debug(`CUBL: Update complete`, {message});
                        // this.progressHooks?.onSuccess();
                        this.updateMessageQueue.push('update_success');
                        port.disconnect();
                    } else if (state === "allDownloadsComplete") {
                        console.debug(`CUBL: allDownloadsComplete`, {message});
                        // this.progressHooks?.onSuccess();
                        this.updateMessageQueue.push('update_success');
                        port.disconnect();
                    }
                }
            });
        }
    }

    private resetUpdatedProtections() {
        for (const key in this.updatedProtections) {
            if (
                Object.prototype.hasOwnProperty.call(
                    this.updatedProtections,
                    key
                )
            ) {
                this.updatedProtections[key] = false;
            }
        }
    }

    private async sendUpdateMessage(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendNativeMessage(
                "com.malwarebytes.browserguard",
                {action: MSG_SAFARI_DATABASE_UPDATE},
                (response) => {
                    console.debug(
                        "SUM: Received response from safari" +
                            JSON.stringify(response)
                    );
                    resolve(response[0]);
                }
            );
        });
    }
}
