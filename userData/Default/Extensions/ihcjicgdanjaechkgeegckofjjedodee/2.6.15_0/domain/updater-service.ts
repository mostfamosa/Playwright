import {SafariUpdaterService} from "@/safari/updater-service.js";
import {browserName} from "@/utils/utils.js";

export interface UpdaterProgressHooks {
    onUpdateStart(): void;
    onDownloadComplete(): void;
    onSuccess(): void;
    onUpdateError(): void;
}

export interface UpdaterService {
    update(progressHooks: UpdaterProgressHooks): Promise<void>;
}

export function getUpdaterService(): UpdaterService {
    if (browserName() === "Safari") {
        return new SafariUpdaterService();
    }

    return new SafariUpdaterService();
}
