import {MSG_IS_EXCLUDED} from "@/app/scripts/app-consts.js";
import {EXCLUSION_SCAMS} from "@/domain/types/exclusion";
import {sendBackgroundMessage} from "@/utils/messaging/messaging";
import {IsExcludedRequest, IsExcludedResponse} from "@/utils/messaging/types";

const warningRegexes = [/(\/warning.mp3)$/i, /(\/0wa0rni0ng0.mp3)$/i];
const trojanPattern = /trojan *spyware *alert *- *error *code: *#.*/i;
const cardAutocompleteAttrs = [
    "cc-name",
    "cc-number",
    "cc-csc",
    "cc-exp-month",
    "cc-exp-year",
    "cc-exp",
    "cc-type",
];

export function isSusAudioPlayer() {
    // BG-883
    const audio = document.getElementById("beep");
    if (
        audio &&
        audio.tagName === "AUDIO" &&
        audio.hasAttribute("autoplay") &&
        isSusAudioChild(audio.children)
    ) {
        console.debug("TSS: Suspicious audio auto-player detected");
        return true;
    }
    return false;
}

export function isSusAudioChild(children) {
    return (
        children &&
        children[0] &&
        children[0].tagName === "SOURCE" &&
        children[0].type &&
        children[0].type.toLowerCase() === "audio/mpeg" &&
        warningRegexes.some((e) => e.test(children[0].src))
    );
}

export function isTrojanScam() {
    const h2Tags = document.getElementsByTagName("h2");
    if (!h2Tags) {
        return false;
    }

    for (let i = 0; i < h2Tags.length; i++) {
        if (h2Tags[i] && trojanPattern.test(h2Tags[i].innerText)) {
            return true;
        }
    }
    return false;
}

export async function isExcluded(url: string, tabId: number): Promise<boolean> {
    const resp = await sendBackgroundMessage<
        IsExcludedRequest,
        IsExcludedResponse
    >({
        type: MSG_IS_EXCLUDED,
        payload: {type: EXCLUSION_SCAMS, domain: url, tabId},
    });

    if (resp.error) {
        console.error(`TSS: Failed to get isExcluded response`, {resp});
        return false;
    }

    console.debug(`TSS: Received isExcluded message response`, {resp});
    return resp.payload?.excluded ?? false;
}

export function isRepeated(data, interval, threshold) {
    // return true if >= N occurrences in interval (milliseconds)
    let thisTime = Date.now();
    if (data.lastTime) {
        let thisInterval = thisTime - data.lastTime;
        if (thisInterval < interval) {
            data.lastCount++;
            if (data.lastCount >= threshold) {
                return true;
            }
        } else {
            data.lastTime = thisTime;
            data.lastCount = 1;
        }
    } else if (threshold === 1) {
        data.lastTime = thisTime;
        data.lastCount = 1;
        return true;
    } else {
        data.lastTime = thisTime;
        data.lastCount = 1;
    }
    return false;
}

export function isCheckoutSkimmer() {
    if (window.location.protocol === "http:") {
        const inputs = document.getElementsByTagName("input");

        return Array.from(inputs).some(
            (input) =>
                input.attributes &&
                // @ts-ignore
                input.attributes.autocomplete &&
                // @ts-ignore
                input.attributes.autocomplete.value &&
                cardAutocompleteAttrs.includes(
                    // @ts-ignore
                    input.attributes.autocomplete.value.toLowerCase()
                )
        );
    }
}
