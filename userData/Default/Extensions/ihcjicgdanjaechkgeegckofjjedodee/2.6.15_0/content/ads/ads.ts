import {hideFacebookAds} from "./facebook";
import {hideTwitterAds} from "./twitter";
import {hideYoutubeAds} from "./youtube";
import {hideRedditAds} from "./reddit";
import {hideLinkedInAds} from "./linkedin";
import {blockInstart} from "./instart";
import {blockChromeTopics} from "./topics";
/* import { sentryInit } from "@/ui/sentry";
import {escapeRegExp} from "lodash";
import * as Sentry from "@sentry/browser";

sentryInit({
    allowUrls: [new RegExp(escapeRegExp(chrome.runtime.getURL("/")), "i")],
    integrations: [
        new Sentry.Integrations.GlobalHandlers({
            onerror: true,
            onunhandledrejection: false, // This has to be disabled because it keeps capturing promise rejections from the main scripts
        }),
    ],
}); */

const pageUrl = `${window.location.protocol}//${window.location.hostname}`;
const siteInfo = new URL(window.location.href);
const host = siteInfo.host;

if (host.endsWith("facebook.com")) {
    hideFacebookAds(pageUrl);
}

if (
    ["x.com", "twitter.com"].some((u) => host === u || host.endsWith(`.${u}`))
) {
    hideTwitterAds(pageUrl);
}

if (host.endsWith("youtube.com")) {
    hideYoutubeAds(pageUrl);
}

if (host.endsWith("reddit.com")) {
    hideRedditAds(pageUrl);
}

if (host.endsWith("linkedin.com")) {
    hideLinkedInAds(pageUrl);
}

// block intrusive ads delivered by invasive reverse proxy (Instart Logic)
if (
    [
        "msn.com",
        "cnet.com",
        "gamespot.com",
        "ign.com",
        "slickdeals.net",
        "webmd.com",
        "sfgate.com",
        "chron.com",
        "metacritic.com",
        "pcmag.com",
        "ranker.com",
        "chicagotribune.com",
        "tvguide.com",
        "newsweek.com",
        "nasdaq.com",
        "sporcle.com",
        "medicinenet.com",
        "edmunds.com",
        "everydayhealth.com",
        "sportingnews.com",
        "metrolyrics.com",
        "boston.com",
        "thoughtcatalog.com",
        "emedicinehealth.com",
        "cafemom.com",
        "streetchopperweb.com",
        "seattlepi.com",
    ].some((domain) => host.endsWith(domain))
) {
    blockInstart();
}

blockChromeTopics(pageUrl);
