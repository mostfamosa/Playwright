const MSG_GET_LOGS = "MSG_SAFARI_GET_LOGS";

export async function getSafariNativeLogs(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        chrome.runtime.sendNativeMessage(
            "com.malwarebytes.browserguard",
            {action: MSG_GET_LOGS},
            (response) => {
                if (chrome.runtime.lastError) {
                    console.debug("RAL: Received error from safari", {
                        error: chrome.runtime.lastError,
                    });
                    reject(chrome.runtime.lastError);
                    return;
                }

                const resp = JSON.parse(response);
                console.debug("RAL: Received response from safari", {response, resp});
                resolve(resp);
            }
        );
    });
}
