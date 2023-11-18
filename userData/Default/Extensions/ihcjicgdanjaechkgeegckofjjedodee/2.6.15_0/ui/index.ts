import Popup from "./Popup.svelte";
/* import { sentryInit } from "./sentry";
import * as Sentry from "@sentry/browser"; */
import "./tailwind.css";

/* sentryInit({integrations: [new Sentry.BrowserTracing()]}); */

const app = new Popup({
    target: document.body,
});

export default app;
