import {writable} from "svelte/store";

export const toasts = writable<Toast[]>([]);

type ToastType = "info" | "success" | "warning" | "error";

export function addInfoToast(message: string, duration = 4000) {
    return addToast(message, "info", duration);
}

export function addSuccessToast(message: string, duration = 3000) {
    return addToast(message, "success", duration);
}

export function addErrorToast(message: string, duration = 4500) {
    return addToast(message, "error", duration);
}

export function addWarningToast(message: string, duration = 4500) {
    return addToast(message, "warning", duration);
}

export function addToast(message: string, type: ToastType, duration?: number) {
    duration = duration || 4000;
    const toast = {
        message: message,
        type: type,
        duration: duration,
        timeout: setTimeout(() => {
            removeToast(toast);
        }, duration),
    };

    toasts.update((t) => {
        removeToastFromArray(t, toast.message);

        pushOrReplaceByKey(t, toast, "message");

        return t;
    });
}

export function removeToast(messageOrToast: any) {
    console.debug("removeToast", messageOrToast);
    toasts.update((t) => {
        removeToastFromArray(t, messageOrToast);

        return t;
    });
}

export function removeAllToasts() {
    toasts.update((t) => {
        for (let toast of t) {
            removeToastFromArray(t, toast);
        }

        return [];
    });
}

// Internal toast removal method (usually used to delete previous duplicated toasts).
// NB! This doesn't update the store value! Use `removeToast()` instead.
function removeToastFromArray(arr: any, messageOrToast: any) {
    let toast;
    if (typeof messageOrToast == "string") {
        toast = findByKey(arr, "message", messageOrToast);
    } else {
        toast = messageOrToast;
    }

    if (!toast) {
        return;
    }

    clearTimeout(toast.timeout);
    removeByKey(arr, "message", toast.message);
}

type Toast = {
    message: string;
    type: ToastType;
    duration: number;
    timeout: ReturnType<typeof setTimeout>;
};

/**
 * Adds or replace an object array element by comparing its key value.
 *
 * @param {Array}  objectsArr
 * @param {Object} item
 * @param {Mixed}  [key]
 */
function pushOrReplaceByKey(objectsArr:any, item: any, key = "id") {
    for (let i = objectsArr.length - 1; i >= 0; i--) {
        if (objectsArr[i][key] == item[key]) {
            objectsArr[i] = item; // replace
            return;
        }
    }

    objectsArr.push(item);
}

/**
 * Returns single element from objects array by matching its key value.
 *
 * @param  {Array} objectsArr
 * @param  {Mixed} key
 * @param  {Mixed} value
 * @return {Object}
 */
function findByKey(objectsArr: any, key: any, value: any) {
    objectsArr = Array.isArray(objectsArr) ? objectsArr : [];

    for (let i in objectsArr) {
        if (objectsArr[i][key] == value) {
            return objectsArr[i];
        }
    }

    return null;
}

/**
 * Removes single element from objects array by matching an item"s property value.
 *
 * @param {Array}  objectsArr
 * @param {String} key
 * @param {Mixed}  value
 */
function removeByKey(objectsArr: any, key: any, value: any) {
    for (let i in objectsArr) {
        if (objectsArr[i][key] == value) {
            objectsArr.splice(i, 1);
            break;
        }
    }
}
