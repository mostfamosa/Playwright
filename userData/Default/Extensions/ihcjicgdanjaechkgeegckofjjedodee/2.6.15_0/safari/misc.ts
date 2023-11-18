const MSG_SAFARI_RESET = "MSG_SAFARI_RESET";

export async function safariReset(): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendNativeMessage(
            "com.malwarebytes.browserguard",
            {action: MSG_SAFARI_RESET, payload: {}},
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                const resp = JSON.parse(response);
                console.debug(
                    "safariReset: Received response from safari" + resp
                );
                resolve(resp);
            }
        );
    });
}
