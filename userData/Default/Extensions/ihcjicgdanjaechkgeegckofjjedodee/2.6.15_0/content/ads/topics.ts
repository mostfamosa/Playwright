import {injectJavascript} from "@/utils/utils.js";
import {getTabId, getTabInfo} from "../helpers";
import { isAdProtectionActive } from "./ad-helpers";

export async function blockChromeTopics(pageUrl: string) {
    //https://developer.apple.com/forums/thread/651215
    if (document.readyState !== "loading") {
        onDOMContentLoaded(pageUrl);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            onDOMContentLoaded(pageUrl);
        });
    }    
}

async function onDOMContentLoaded(pageUrl: string) {
    console.debug("Block Chrome Topics")
    const tabId = await getTabId();
    const shouldBlockAds = await isAdProtectionActive(tabId, pageUrl);
    if (shouldBlockAds === false) {
        return;
    }

    injectJavascript(
        `if (!!document.browsingTopics) { delete Document.prototype.browsingTopics; }`
    );
}
