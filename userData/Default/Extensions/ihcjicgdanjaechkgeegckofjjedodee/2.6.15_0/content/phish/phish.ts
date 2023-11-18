import {isValidIP, urlTLD} from "@/utils/utils.js";
import {createBlockUrl, getTabId, isSafari} from "../helpers";
import {
    signInStrings,
    susStrings,
    suspiciousDescs,
    suspiciousTitles,
    tunnels,
} from "./consts";
import {
    FLAG_ENABLE_SUSPICIOUS_TITLE_DETECTION,
    MSG_IS_EXCLUDED,
    MSG_IS_WHITELISTED_SCAM,
    MSG_QUERY_FEATURE_FLAG,
} from "@/app/scripts/app-consts.js";
import {sendBackgroundMessage} from "@/utils/messaging/messaging";
import {IsExcludedRequest, IsExcludedResponse} from "@/utils/messaging/types";
import {EXCLUSION_SCAMS} from "@/domain/types/exclusion";
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

// Turn this off after testing for FPs
const tunnelPhishingSilentMode = true;

function pathname(path: string = "") {
    return (path.endsWith(".") ? path.slice(0, -1) : path).toLowerCase();
}

function onDetection(type, subtype) {
    chrome.runtime.sendMessage(
        {
            type: "detection",
            parameters: {type, subtype, url: window.location.href},
        },
        ({detect}) => {
            if (detect) {
                blockDetection(type, subtype);
            }
        }
    );
}

function blockDetection(type, subtype) {
    console.debug("PHISH: Removing suspicious iframes");
    // delete iframes so they can't show the popups either
    document.querySelectorAll("iframe").forEach((element) => {
        element.remove();
    });

    const prevUrl = isSafari ? document.location : null;
    // eslint-disable-next-line max-len
    const blockUrl = createBlockUrl(
        null,
        window.location.href,
        type,
        subtype,
        null,
        null,
        // @ts-ignore
        prevUrl
    );
    window.location.replace(blockUrl);
}

function phishDetection() {
    console.debug("PHISH: Checking for Phishing page");
    let text;

    if (pathname(window.location.pathname).endsWith("login.php")) {
        text = document.body.innerText && document.body.innerText.toLowerCase();
        if (["natwest.com", "card number"].some((s) => text.includes(s))) {
            console.debug("PHISH: Caught a Phishing page");
            if (isSafari) {
                blockDetection("scam", "phishing");
            } else {
                onDetection("scam", "phishing");
            }
        }
    }

    if (
        window.location.protocol === "http:" &&
        isValidIP(window.location.hostname)
    ) {
        const fullUrl =
            window.location.href && window.location.href.toLowerCase();

        if (fullUrl && susStrings.some((s) => fullUrl.includes(s))) {
            text =
                text ||
                (document.body.innerText &&
                    document.body.innerText.toLowerCase());

            if (text && signInStrings.some((s) => text.includes(s))) {
                console.debug("PHISH: Caught a Phishing page");
                if (isSafari) {
                    blockDetection("scam", "phishing");
                } else {
                    onDetection("scam", "phishing");
                }
            }
        }
    }

    if (tunnels.some((t) => urlTLD(window.location.href).includes(t))) {
        text =
            text ||
            (document.body.innerText && document.body.innerText.toLowerCase());

        if (text && signInStrings.some((s) => text.includes(s))) {
            console.debug("PHISH: Caught a Phishing page");
            if (tunnelPhishingSilentMode) {
                chrome.runtime.sendMessage(
                    {
                        type: "telemetryPhishingTunnel",
                        parameters: {url: window.location.href},
                    },
                    (response) => {}
                );
            } else {
                if (isSafari) {
                    blockDetection("scam", "phishing");
                } else {
                    onDetection("scam", "phishing");
                }
            }
        }
    }
    /*eslint max-len: ["error", { "ignoreComments": true }]*/
    // check if document.title is in suspiciousTitles or a meta description is in suspiciousDescs
    // TODO: figure out how to handle this in safari
    chrome.runtime.sendMessage(
        {
            type: MSG_IS_WHITELISTED_SCAM,
            payload: {
                domain: window.location.origin,
            },
        },
        (whitelisted) => {
            if (whitelisted) {
                return;
            }

            chrome.runtime.sendMessage(
                {
                    type: MSG_QUERY_FEATURE_FLAG,
                    payload: {feature: FLAG_ENABLE_SUSPICIOUS_TITLE_DETECTION},
                },
                (enableSuspiciousTitleDetection) => {
                    if (!enableSuspiciousTitleDetection) {
                        return;
                    }

                    let description = "";
                    let descriptionFound = Array.from(
                        document.getElementsByTagName("meta")
                    )
                        .filter((f) => f.name === "description")
                        .some((d) => {
                            description = d.content;
                            return suspiciousDescs.indexOf(d.content) > -1;
                        });
                    if (descriptionFound) {
                        // eslint-disable-next-line max-len
                        console.log(
                            `PHISH: (PAGE_BLOCK) Caught a Phishing page. Page has suspicious description: ${description}`
                        );
                        // eslint-disable-next-line max-len
                        isSafari
                            ? blockDetection("scam", "phishing")
                            : onDetection("scam", "phishing");
                        return;
                    }

                    // check if document.title is in suspiciousTitles
                    if (suspiciousTitles.indexOf(document.title) > -1) {
                        // eslint-disable-next-line max-len
                        console.log(
                            `PHISH: (PAGE_BLOCK) Caught a Phishing page. Page has suspicious title: ${document.title}`
                        );
                        // eslint-disable-next-line max-len
                        isSafari
                            ? blockDetection("scam", "phishing")
                            : onDetection("scam", "phishing");
                        return;
                    }
                }
            );

            // if the page has an unsecure protocol and has a login form
            if (window.location.protocol === "http:") {
                document.querySelectorAll("form").forEach((form) => {
                    if (form.action.includes("login")) {
                        // eslint-disable-next-line max-len
                        console.log(
                            `PHISH: (PAGE_BLOCK) Caught a Phishing page: Post request through an unsecure protocol`
                        );
                        // eslint-disable-next-line max-len
                        isSafari
                            ? blockDetection("scam", "insecure login")
                            : onDetection("scam", "insecure login");
                        return;
                    }
                });
            }
        }
    );
}

getTabId().then((tabId) => {
    sendBackgroundMessage<IsExcludedRequest, IsExcludedResponse>({
        type: MSG_IS_EXCLUDED,
        payload: {
            type: EXCLUSION_SCAMS,
            domain: window.location.hostname,
            tabId,
        },
    }).then((resp) => {
        if (resp && !resp.payload?.excluded) {
            phishDetection();
        }
    });
});
