import {
    FEAT_CONTENT_CONTROLS,
    FEAT_EXPORT_IMPORT,
    LICENSE_STATE_ENUM,
} from "@/app/scripts/app-consts.js";
import {BUILD_NUMBER} from "@/app/scripts/build-consts.js";

// TODO: as more and more of these are used, we should move them to their own files

export const INTERNAL_VERSION = `Build ${BUILD_NUMBER}`;
let SHOULD_SHOW_WELCOME = false;
let READY_TO_ACCEPT_REQUESTS = false;
let SETTINGS = {
    enableProtection: true,
    enableProtectionAds: true,
    // enableProtectionClickbait: null,
    enableProtectionGtld: false,
    enableProtectionMalware: true,
    enableProtectionScams: true,
    enableNativeMessaging: null,
    enableVerboseLogging: false,
    enableMonthlyNotification: true,
    enableMaliciousNotification: true,
};
let DATABASES = {};
let FEATURE_FLAGS = {};
let EXCLUSIONS = {};
let EXCLUSION_TEMPORARY = null;
export let EXCLUSION_INDIVIDUAL: Record<any, any> = {};
let RECORD = {};
let RECORD_LOADED = false;
let ALL_TIME_STATS = {ads: 0, malwares: 0, scams: 0, content: 0};
let ALL_TIME_STATS_LOADED = false;
export let SAFE_CACHE: Record<any, any> = {};
let LICENSE = LICENSE_STATE_ENUM.LicenseStateFree;
const RISKY_TLDS = [
    "agency",
    "beauty",
    "bid",
    "biz",
    "cam",
    "casa",
    "cc",
    "cf",
    "cfd",
    "ga",
    "gdn",
    "gq",
    "hair",
    "icu",
    "info",
    "ml",
    "online",
    "pw",
    "stream",
    "su",
    "surf",
    "tech",
    "tk",
    "top",
    "win",
    "ws",
];
const RISKY_EXECUTABLES = ["exe", "dmg", "bat", "sh", "pkg"];
const ALWAYS_ALLOW = {
    "amazon.com": true,
    "www.amazon.com": true,
    "baidu.com": true,
    "www.baidu.com": true,
    "bilibili.com": true,
    "www.bilibili.com": true,
    "bing.com": true,
    "www.bing.com": true,
    "cnn.com": true,
    "www.cnn.com": true,
    "discord.com": true,
    "www.discord.com": true,
    "discordapp.com": true,
    "www.discordapp.com": true,
    "ebay.com": true,
    "www.ebay.com": true,
    "facebook.com": true,
    "www.facebook.com": true,
    "foxnews.com": true,
    "www.foxnews.com": true,
    "google.com": true,
    "www.google.com": true,
    "instagram.com": true,
    "www.instagram.com": true,
    "linkedin.com": true,
    "www.linkedin.com": true,
    "live.com": true,
    "www.live.com": true,
    "mail.ru": true,
    "www.mail.ru": true,
    "malwarebytes.com": true,
    "www.malwarebytes.com": true,
    "mbamupdates.com": true,
    "www.mbamupdates.com": true,
    "microsoft.com": true,
    "www.microsoft.com": true,
    "microsoftonline.com": true,
    "www.microsoftonline.com": true,
    "mozilla.com": true,
    "www.mozilla.com": true,
    "msn.com": true,
    "www.msn.com": true,
    "mwbsys.com": true,
    "www.mwbsys.com": true, // Malwarebytes CDN
    "naver.com": true,
    "www.naver.com": true,
    "netflix.com": true,
    "www.netflix.com": true,
    "nsslabs.com": true,
    "www.nsslabs.com": true,
    "office.com": true,
    "www.office.com": true,
    "pinterest.com": true,
    "www.pinterest.com": true,
    "qq.com": true,
    "www.qq.com": true,
    "reddit.com": true,
    "www.reddit.com": true,
    "tiktok.com": true,
    "www.tiktok.com": true,
    "twitch.tv": true,
    "www.twitch.tv": true,
    "twitter.com": true,
    "www.twitter.com": true,
    "virustotal.com": true,
    "www.virustotal.com": true,
    "vk.com": true,
    "www.vk.com": true,
    "weather.com": true,
    "www.weather.com": true,
    "whatsapp.com": true,
    "www.whatsapp.com": true,
    "wikipedia.org": true,
    "www.wikipedia.org": true,
    "windows.net": true,
    "www.windows.net": true,
    "windowsupdate.com": true,
    "www.windowsupdate.com": true,
    "yahoo.co.jp": true,
    "www.yahoo.co.jp": true,
    "yahoo.com": true,
    "www.yahoo.com": true,
    "yandex.ru": true,
    "www.yandex.ru": true,
    "youtube.com": true,
    "www.youtube.com": true,
    "zoom.us": true,
    "www.zoom.us": true,
};
const NEW_FEATURES = [FEAT_CONTENT_CONTROLS, FEAT_EXPORT_IMPORT];
export const TAB_MALWARE_NOTIFIED = new Set();

export function clearSafeCache() {
    SAFE_CACHE = {};
}