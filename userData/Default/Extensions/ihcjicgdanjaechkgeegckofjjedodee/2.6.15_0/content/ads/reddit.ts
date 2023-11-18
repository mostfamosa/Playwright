import { GetTabInfoResponse } from "@/utils/messaging/types";
import { getTabInfo} from "../helpers";
import {isAdProtectionActive, isHidden, recordBlockedAd} from "./ad-helpers";

export async function hideRedditAds(pageUrl: string) {
    const clearRedditAds = (tab: GetTabInfoResponse) => {
        const matches = document.getElementsByClassName("promotedlink");
        for (let i = 0; i < matches.length; i++) {
            if (matches[i] && !isHidden(matches[i])) {
                (matches[i] as HTMLElement).style.display = "none";
                recordBlockedAd(tab);
            }
        }
    };

    const tab = await getTabInfo();
    const shouldBlockAds = await isAdProtectionActive(tab.tabId, pageUrl);
    if (shouldBlockAds === false) {
        return;
    }

    clearRedditAds(tab);
    setInterval(() => clearRedditAds(tab), 2000);
}