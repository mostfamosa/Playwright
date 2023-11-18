import { MSG_IS_AD_PROTECTION_ACTIVE } from "@/app/scripts/app-consts.js";
import { sendBackgroundMessage } from "@/utils/messaging/messaging";
import { GetTabInfoResponse, IsAdProtectionActiveRequest, IsAdProtectionActiveResponse, IsProtectionActiveRequest, IsProtectionActiveResponse } from "@/utils/messaging/types";

export function isHidden(element) {
    return (
        element &&
        element.style &&
        element.style.display &&
        element.style.display.trim() == "none"
    );
}

export async function isAdProtectionActive(
    tabId: number,
    pageUrl: string
): Promise<boolean> {
    const resp = await sendBackgroundMessage<IsAdProtectionActiveRequest, IsAdProtectionActiveResponse>({type: MSG_IS_AD_PROTECTION_ACTIVE, payload: {domain: pageUrl}});
    return resp.payload?.active ?? false;
}

export function recordBlockedAd(tab: GetTabInfoResponse) {
    // TODO
}

// TODO
export async function isEasyListEnabled(tabId: number): Promise<boolean> {
    return false;
}