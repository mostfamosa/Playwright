import {GetTabInfoResponse, LoadInlineScriptRequest} from "@/utils/messaging/types";
import {
    getTabId,
    getTabInfo,
    isSafari,
} from "../helpers";
import {isAdProtectionActive, isHidden, recordBlockedAd} from "./ad-helpers";
import {MSG_LOAD_INLINE_SCRIPT as MSG_EXECUTE_INLINE_SCRIPT} from "@/app/scripts/app-consts.js";
import { urlHost } from "@/utils/utils.js";
import { pressSkipButton, trimmerMethod } from "@/app/scripts/adblockers/adb-youtube.js";
import { addToPage } from "@/app/scripts/adblockers/adblockers-utils.js";
import { sendBackgroundMessage } from "@/utils/messaging/messaging";

const hidables = [
    ".badge-style-type-ad",
    ".companion-ad-container",
    ".GoogleActiveViewElement",
    '.list-view[style="margin: 7px 0pt;"]',
    ".promoted-sparkles-text-search-root-container",
    ".promoted-videos",
    ".sparkles-light-cta",
    ".statement-banner-foreground-content",
    ".ytd-action-companion-ad-renderer",
    ".ytd-ad-inline-playback-meta-block",
    ".ytd-ad-slot-renderer",
    ".ytd-carousel-ad-renderer",
    ".ytd-compact-promoted-video-renderer",
    ".ytd-companion-slot-renderer",
    ".ytd-display-ad-renderer",
    ".ytd-in-feed-ad-layout-renderer",
    ".ytd-merch-shelf-renderer",
    ".ytd-player-legacy-desktop-watch-ads-renderer",
    ".ytd-promoted-sparkles-text-search-renderer",
    ".ytd-promoted-sparkles-web-renderer",
    ".ytd-promoted-video-renderer",
    ".ytd-rich-item-renderer > ytd-ad-slot-renderer",
    ".ytd-search-pyv-renderer",
    ".ytd-video-masthead-ad-primary-video-overlay-renderer",
    ".ytd-video-masthead-ad-v3-renderer",
    ".ytp-ad-action-interstitial-background-container",
    ".ytp-ad-action-interstitial-slot",
    ".ytp-ad-button",
    ".ytp-ad-overlay-container",
    ".ytp-ad-player-overlay-flyout-cta",
    ".ytp-ad-progress-list",
    ".ytp-ad-progress",
    ".ytp-ad-module",
    "#player-ads > ytd-player-legacy-desktop-watch-ads-renderer",
    "#rendering-content > ytd-video-masthead-ad-v3-renderer",
    "#invideo-overlay\\:0 > div > div.ytp-ad-image-overlay",
    "#player-overlay\\:0 > div.ytp-ad-player-overlay-flyout-cta.ytp-ad-player-overlay-flyout-cta-rounded",
    "#action-companion-click-target",
    '[class^="ytd-display-ad-"]',
    '[layout*="display-ad-"]',
    "#feed-pyv-container",
    "#masthead-ad",
    "#merch-shelf",
    "#pla-shelf",
    "#player-ads",
    "#show-ad",
    "#video-masthead",
    "#YtKevlarVisibilityIdentifier",
    "#YtSparklesVisibilityIdentifier",
    'a[href^="https://www.googleadservices.com/pagead/aclk?"]',
    "ytd-ad-slot-renderer",
    "ytd-banner-promo-renderer",
    "ytd-compact-promoted-video-renderer",
    "ytd-companion-slot-renderer",
    "ytd-display-ad-renderer",
    "ytd-promoted-sparkles-text-search-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-single-option-survey-renderer",
    "ytd-video-masthead-ad-advertiser-info-renderer",
    "ytd-video-masthead-ad-v3-renderer",
    "ytm-companion-slot",
    "ytm-promoted-sparkles-text-search-renderer",
    "ytm-promoted-sparkles-web-renderer",
    "YTM-PROMOTED-VIDEO-RENDERER",
];

export async function hideYoutubeAds(pageUrl: string) {
    console.debug("Youtube: hideYoutubeAds", {pageUrl});
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
            afterDOMLoaded(pageUrl)
        );
    } else {
        afterDOMLoaded(pageUrl);
    }
}

async function afterDOMLoaded(pageUrl: string) {
    const tabInfo = await getTabInfo();
    const shouldBlockAds = await isAdProtectionActive(tabInfo.tabId, pageUrl);
    console.log("Youtube: shouldBlockAds", shouldBlockAds);
    if (shouldBlockAds === false) {
        return;
    }

    if (isSafari) {
        safariSkipAds(tabInfo);
        clearYoutubeAds(tabInfo);
        setInterval(() => clearYoutubeAds(tabInfo), 2000);
        setInterval(() => safariSkipAds(tabInfo), 1500);
    } else {
        clearYoutubeAds(tabInfo);
        setInterval(() => clearYoutubeAds(tabInfo), 2000);
        let methods = `const t = ${trimmerMethod.toString()};`;
                methods = methods + ` const p = ${pressSkipButton.toString()};`;
                methods = methods + ` const a = ${addToPage.toString()};`;
                let runner = `${methods}
                    t();
                    p();
                    setInterval(p, 250);
                    console.log("hede");
                    a(t.toString(), 'mwb-adb');
                `;
                let code = `(() => {${runner}})();`;
                await executeJavascript(code);
    }
}

function executeJavascript(code: string) {
    return new Promise((resolve) => {
        getTabId().then((tabId) => {
            sendBackgroundMessage<LoadInlineScriptRequest, boolean>({
                type: MSG_EXECUTE_INLINE_SCRIPT,
                payload: {
                    tabId,
                    source: code,
                },
            })            
        });        
    });
}

const clearYoutubeAds = (tab: GetTabInfoResponse) => {
    const nodes = document.querySelectorAll(hidables.join(","));
    // @ts-ignore
    for (const node of nodes) {
        if (!isHidden(node)) {
            (node as HTMLElement).style.display = "none";
            recordBlockedAd(tab);
        }
    }
};

const safariSkipAds = (tab: GetTabInfoResponse) => {
    // Finds hidden "Skip Ads" button and presses it
    const skipBtn = document.getElementsByClassName(
        "ytp-ad-skip-button ytp-button"
    );
    if (skipBtn && skipBtn[0]) {
        (skipBtn[0] as HTMLButtonElement).click();
        recordBlockedAd(tab);
        return; //Return, we want to avoid counting the regular ad twice, they also load the 'ytp-ad-duration-remaining' div
    }
    //Unskippable ads
    const adFrames = document.getElementsByClassName(
        "ytp-ad-duration-remaining"
    );
    if (adFrames && adFrames[0]) {
        const video = document.querySelectorAll("video");
        if (video) {
            // @ts-ignore
            for (const vid of video) {
                if (Number.isNaN(vid.duration)) {
                    continue;
                }
                vid.currentTime = vid.duration - 0.5;
            }
            recordBlockedAd(tab);
        }
    }
};
