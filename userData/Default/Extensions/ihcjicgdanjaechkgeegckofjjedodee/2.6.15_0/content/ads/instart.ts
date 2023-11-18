import { injectJsFile } from "@/utils/utils.js";

export function blockInstart() {
    const handleNotWhitelisted = (property) => {
        const params = {
            isWhitelisted: false,
            property: property,
        };
        window.postMessage(
            {
                type: "isInstartWhitelistedResponse",
                parameters: JSON.stringify(params),
            },
            `${window.location.protocol}//${window.location.host}`
        );
    };

    const checkIfInstartWhitelisted = (href, property) => {
        chrome.runtime.sendMessage(
            chrome.runtime.id,
            {
                type: "isInstartWhitelisted",
                parameters: {href: window.location.href, prop: property},
            },
            (response) => {
                if (response && response.isWhitelisted) {
                    console.debug(
                        "INS: " +
                            property +
                            " is whitelisted for " +
                            window.location.href
                    );
                } else {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "INS: Failed with is-whitelisted request for " +
                                property +
                                ": " +
                                chrome.runtime.lastError.message
                        );
                    }
                    handleNotWhitelisted(property);
                }
            }
        );
    };

    window.addEventListener("message", (event) => {
        const originUrl = new URL(event.origin);
        const eventHost = originUrl.host;
        if (
            event.data.type === "isInstartWhitelisted" &&
            eventHost === window.location.host
        ) {
            const params = JSON.parse(event.data.parameters);
            checkIfInstartWhitelisted(params.href, params.prop);
        }
    });

    const extId = chrome.runtime.id;
    injectJsFile("injection-instart.js", {extId: extId});
}