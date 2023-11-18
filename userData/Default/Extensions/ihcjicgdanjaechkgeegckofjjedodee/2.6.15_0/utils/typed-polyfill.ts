import {chrome as polyChrome} from "@/utils/polyfill.js";
const browser = polyChrome as typeof chrome;

export {
     browser as chrome,
};
