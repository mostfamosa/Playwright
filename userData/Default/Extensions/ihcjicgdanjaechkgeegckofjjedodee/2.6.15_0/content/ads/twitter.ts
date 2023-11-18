import { GetTabInfoResponse } from "@/utils/messaging/types";
import { getTabInfo } from "../helpers";
import {isAdProtectionActive, isHidden, recordBlockedAd} from "./ad-helpers";

export async function hideTwitterAds(pageUrl: string) {
    const malwarebytesClearTwitterAds = (tab: GetTabInfoResponse) => {
        const divs = document.querySelectorAll(
            'main div[data-testid="cellInnerDiv"]'
        );

        // @ts-ignore
        divs.forEach((div: HTMLElement) => {
            const spans = div.querySelectorAll('div[dir="ltr"] span');

            // @ts-ignore
            Array.from(spans).some((span: HTMLSpanElement) => {
                if (
                    span.querySelector &&
                    !span.querySelector('span') &&
                    span.innerText === 'Ad'
                ) {
                    if (!isHidden(div)) {
                        div.style.display = 'none';
                        recordBlockedAd(tab);
                    }
                    return true;
                }
            });
        });
    };

    const tabInfo = await getTabInfo();
    const shouldBlockAds = await isAdProtectionActive(tabInfo.tabId, pageUrl);
    if (shouldBlockAds === false) {
        return;
    }

    malwarebytesClearTwitterAds(tabInfo);
    setInterval(() => malwarebytesClearTwitterAds(tabInfo), 2000);
}