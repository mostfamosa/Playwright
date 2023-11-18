/* import * as Sentry from "@sentry/svelte";

export function sentryInit(options: Record<string, any> = {}) {
    let params = {
        dsn: "https://f749b5abe8e35b39c871e87bf7c0db6c@o438337.ingest.sentry.io/4506122597433344",
        tracesSampleRate: 0.005, // Capture 100% of the transactions, reduce in production!
        // Session Replay
        replaysSessionSampleRate: 0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 0,
        // This variable is set in Webpack itself (see webpack.DefinePlugin)
        environment: process.env.NODE_ENV,
        enabled: process.env.NODE_ENV === 'production',
        release: chrome.runtime.getManifest().version
    };
    Object.assign(params, options);

    Sentry.init(params);
}
 */