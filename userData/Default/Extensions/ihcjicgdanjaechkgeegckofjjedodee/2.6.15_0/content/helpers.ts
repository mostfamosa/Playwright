import {
    GetTabIdResponse,
    GetTabInfoResponse,
} from "@/utils/messaging/types";
import {MSG_TAB_ID_GET, MSG_TAB_INFO_GET} from "@/app/scripts/app-consts.js";
import {sendBackgroundMessage} from "@/utils/messaging/messaging";
import {browserName, urlHost} from "@/utils/utils.js";

export const isSafari = browserName() === "Safari";

export async function getTabInfo(): Promise<GetTabInfoResponse> {
    const tabInfo = await sendBackgroundMessage<unknown, GetTabInfoResponse>({
        type: MSG_TAB_INFO_GET,
    });
    console.debug("tabInfo", tabInfo);
    return tabInfo.payload!;
}

export async function getTabId(): Promise<number> {
    const resp = await sendBackgroundMessage<unknown, GetTabIdResponse>({
        type: MSG_TAB_ID_GET,
    });
    console.debug("getTabId", resp);
    return resp.payload!.tabId;
}

export function createBlockUrl(
    optionalReferrer,
    url,
    type,
    subtype,
    tabId,
    optionalFilename,
    optionalPrevUrl: string | null = null
) {
    return (
        chrome.runtime.getURL(`ui/eventpages/block/block.html`) +
        "?" +
        redirectParameters({
            referrer: optionalReferrer,
            url,
            host: urlHost(url),
            type,
            subtype,
            tabId,
            filename: optionalFilename,
            prevUrl: optionalPrevUrl,
        })
    );
}

export function redirectParameters(parameters) {
    let searchParams = new URLSearchParams();
    for (let key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            searchParams.set(key, parameters[key]);
        }
    }
    return searchParams.toString();
}
