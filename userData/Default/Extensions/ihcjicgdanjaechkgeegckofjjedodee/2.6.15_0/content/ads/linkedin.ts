import {GetTabInfoResponse} from "@/utils/messaging/types";
import {
    getTabInfo,
} from "../helpers";
import {isAdProtectionActive, isHidden, recordBlockedAd} from "./ad-helpers";

const adTexts = {
    en: {
        isPromoted: (text) => text == "promoted",
    },
    es: {
        isPromoted: (text) => text == "promocionado",
    },
    pt: {
        isPromoted: (text) => text == "patrocinado",
    },
    fr: {
        isPromoted: (text) => text == "post sponsorisé",
    },
    it: {
        isPromoted: (text) => text == "post sponsorizzato",
    },
    nl: {
        isPromoted: (text) => text == "gepromoot",
    },
    pl: {
        isPromoted: (text) => text == "treść promowana",
    },
    ru: {
        isPromoted: (text) => text == "продвигается",
    },
};
let lang = "en";

export async function hideLinkedInAds(pageUrl: string) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
            afterDOMLoaded(pageUrl)
        );
    } else {
        afterDOMLoaded(pageUrl);
    }
}

async function afterDOMLoaded(pageUrl: string) {
    const tab = await getTabInfo();
    const shouldBlockAds = await isAdProtectionActive(tab.tabId, pageUrl);
    if (shouldBlockAds === false) {
        return;
    }
    lang = document.documentElement.lang || "en";
    if (!Object.keys(adTexts).includes(lang)) {
        lang = "en";
    }
    blockInitialPromotedFeedItems(tab);
    observeAndBlockPromotedFeedItems(tab);
    hideSideBanners(tab);
    setInterval(() => hideSideBanners(tab), 2000);
}

function isPromotedFeedUnit(feedUnit) {
    const spans = feedUnit.querySelectorAll(
        'div[data-control-name="actor"] span.t-12.t-black--light'
    );
    const span = spans[spans.length - 1];
    const text = ((span && span.innerText) || "").trim().toLowerCase();
    return adTexts[lang].isPromoted(text);
}

function getPostMainDiv(ele) {
    let current = ele;
    while (current) {
        const dataId = current.getAttribute("data-id") || "";
        if (
            current.classList.contains("relative") &&
            dataId.startsWith("urn:")
        ) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function checkFeedUnit(tab: GetTabInfoResponse, feedUnit) {
    if (feedUnit.constructor.name !== "HTMLDivElement") {
        return;
    }
    if (isPromotedFeedUnit(feedUnit)) {
        const mainDiv = getPostMainDiv(feedUnit);
        if (mainDiv && mainDiv.style && !isHidden(mainDiv)) {
            mainDiv.style.display = "none";
            recordBlockedAd(tab);
        }
    }
}

function observeAndBlockPromotedFeedItems(tab: GetTabInfoResponse) {
    const mainObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((addedNode) => {
                    checkFeedUnit(tab, addedNode);
                });
            }
        });
    });

    mainObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

function blockInitialPromotedFeedItems(tab: GetTabInfoResponse) {
    const feedUnits = document.querySelectorAll(
        "#main > div:nth-child(3) > div > div"
    );
    // @ts-ignore
    for (let feedUnit of feedUnits) {
        checkFeedUnit(tab, feedUnit);
    }
}

function hideSideBanners(tab: GetTabInfoResponse) {
    const divs = document.body.querySelectorAll(".ad-banner-container");
    // @ts-ignore
    for (let div of divs) {
        if (!isHidden(div)) {
            (div as HTMLElement).style.display = "none";
            recordBlockedAd(tab);
        }
    }
}
