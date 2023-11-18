<script lang="ts">
    import {MSG_DOWNLOAD_LOGS, MSG_RESET} from "@/app/scripts/app-consts.js";
    import {getSettingsService} from "@/domain/settings-service";
    import {SETTING_TELEMETRY_CONSENT} from "@/domain/types/settings";
    import Divider from "@/ui/components/Divider.svelte";
    import PrimaryButton from "@/ui/components/PrimaryButton.svelte";
    import Switch from "@/ui/components/Switch.svelte";
    import {sendBackgroundMessage} from "@/utils/messaging/messaging";
    import {
        DownloadLogsRequest,
        DownloadLogsResponse,
    } from "@/utils/messaging/types";
    import {chrome} from "@/utils/typed-polyfill";
    import {onMount} from "svelte";
    import {getUpdaterService} from "@/domain/updater-service";
    import ConfirmModal from "../components/app/ConfirmModal.svelte";
    import SpinnerIcon from "../svgs/SpinnerIcon.svelte";
    import CheckmarkIcon from "../svgs/CheckmarkIcon.svelte";
    import CheckMarkWhiteIcon from "../svgs/CheckMarkWhiteIcon.svelte";

    let isDownloadingLogs = false;
    let extensionVersion = "0.0.0";
    let telemetryConsent = false;
    let isUpdating = false;
    let updateCompleted = false;
    let updateFailed = false;
    let updateBtnText = "Check for database updates";

    let showFactoryResetConfirmation = false;

    onMount(() => {
        console.log("PageSupport: onMount");
        getSettingsService()
            .getExtensionVersion()
            .then((version) => {
                console.log("PageSupport: onMount: version", version);
                extensionVersion = version;
            });

        getSettingsService()
            .getSetting(SETTING_TELEMETRY_CONSENT)
            .then((consent) => {
                console.log("PageSupport: onMount: consent", consent);
                telemetryConsent = consent as boolean;
            });
    });

    const hooks = {
        onUpdateStart: () => {
            updateBtnText = "Updating";
            console.debug("PageSupport: onUpdateStart");
        },
        onDownloadComplete: () => {
            updateBtnText = "Updating";
            console.debug("PageSupport: onDownloadComplete");
        },
        onSuccess: () => {
            isUpdating = false;
            updateBtnText = "Databases are up to date";
            updateCompleted = true;
            console.debug("PageSupport: onSuccess");
        },
        onUpdateError: () => {
            isUpdating = false;
            updateFailed = true;
            updateBtnText = "Check for database updates";
            console.debug("PageSupport: onUpdateError");
        },
    };

    function checkForUpdatesClicked() {
        isUpdating = true;
        getUpdaterService().update(hooks);
    }

    async function downloadDebugLogsClicked() {
        isDownloadingLogs = true;
        const resp = await sendBackgroundMessage<
            DownloadLogsRequest,
            DownloadLogsResponse
        >({type: MSG_DOWNLOAD_LOGS, payload: {fullLog: true}});
        if (resp.error) {
            console.error("Failed to export debug logs", resp.error);
            return;
        }
        isDownloadingLogs = false;

        downloadLogsToFile(resp.payload!.data);
    }

    function factoryResetClicked() {
        showFactoryResetConfirmation = true;
    }

    function downloadLogsToFile(logDataStr: string) {
        let dlDownloadName;
        const logData = logDataStr;
        const url = URL.createObjectURL(
            new Blob([logData], {type: "text/plain"})
        );
        console.log("MDL: Generated logfile", url);
        const time = new Date();
        dlDownloadName =
            `BG-Logs_v${chrome.runtime.getManifest().version}_` +
            `${time
                .toISOString()
                .slice(
                    0,
                    10
                )}_${time.getHours()}${time.getMinutes()}${time.getSeconds()}.txt`;
        console.log("MDL: Downloading logfile", {dlDownloadName, url});
        window.open(url, "_blank");
        console.log("Successfully Downloaded logs");
    }
</script>

<div
    class="flex flex-col justify-start items-start w-full h-full pt-6 dark:text-white dark:text-opacity-80"
>
    <div class="grid grid-cols-2 gap-6 w-full">
        <div
            class="w-full flex flex-col items-start gap-4 text-textPrimary dark:text-white dark:text-opacity-80"
        >
            <h3 class="text-base font-medium">Product information</h3>
            <div class="flex flex-col items-start font-normal text-sm">
                <p>Malwarebytes Browser Guard Version</p>
                <p>{extensionVersion}</p>
            </div>
        </div>
        <div class="w-full flex flex-col gap-2 items-start justify-start">
            <div class="w-fit">
                <PrimaryButton
                    outlined
                    on:click={isUpdating ? null : checkForUpdatesClicked}
                    class="gap-2 {updateCompleted
                        ? '!border-[#1C1B1F] !text-[#1C1B1F]'
                        : ''}"
                    disabled={updateCompleted}
                >
                    {#if isUpdating}
                        <div
                            class="flex flex-col justify-center items-center origin-center spin"
                        >
                            <SpinnerIcon
                                class="w-4 h-4"
                                style="margin-left: -3px; margin-top: -3px; "
                            />
                        </div>
                    {:else if updateCompleted}
                        <div
                            class="flex flex-col justify-center items-center"
                        >
                            <CheckMarkWhiteIcon fill="#1C1B1F" />
                        </div>
                    {/if}

                    <span>{updateBtnText}</span>
                </PrimaryButton>
            </div>
            {#if updateFailed}
                <span class="text-red-500 font-normal text-sm">
                    An error occurred. Please try again or contact Support
                </span>
            {/if}
        </div>
    </div>
    <Divider class="mb-6 mt-6" />
    <div class="grid grid-cols-2 gap-6 w-full">
        <div
            class="w-full flex flex-col items-start gap-4 text-textPrimary dark:text-white dark:text-opacity-80"
        >
            <h3 class="text-base font-medium">Product support</h3>
            <a
                href="https://www.malwarebytes.com/?guard=1&x-source=company"
                target="_blank">Malwarebytes website</a
            >
            <a
                href="https://links.malwarebytes.com/support/browserguard/?guard=1&x-source=support"
                target="_blank">Browser Guard support</a
            >
            <a
                href="https://links.malwarebytes.com/support/browserguard_guide?guard=1&x-source=userguide"
                target="_blank">Product user guides</a
            >
            <a
                href="https://blog.malwarebytes.com/?guard=1&x-source=labs"
                target="_blank">Malwarebytes Labs news</a
            >
        </div>
        <div class="w-full flex flex-col items-start justify-start gap-4">
            <h3 class="text-base font-medium">Legal and Policy</h3>
            <a
                href="https://www.malwarebytes.com/privacy/policy-for-browser-guard/?guard=1&x-source=policy"
                target="_blank">Privacy Policy</a
            >
            <a
                href="https://www.malwarebytes.com/eula/?guard=1&x-source=eula"
                target="_blank">End User License Agreement (EULA)</a
            >
        </div>
    </div>
    <Divider class="mb-6 mt-6" />
    <div class="grid grid-cols-2 gap-6 w-full">
        <div
            class="w-full flex flex-col items-start gap-4 text-textPrimary dark:text-white dark:text-opacity-80"
        >
            {#if isDownloadingLogs}
                <p
                    class="text-sm font-normal text-left text-gray-500 dark:text-white dark:text-opacity-60"
                >
                    Downloading logs...
                </p>
            {:else}
                <a href="/" on:click|preventDefault={downloadDebugLogsClicked}
                    >Download Debug Logs</a
                >
            {/if}
            <a href="/" on:click|preventDefault={factoryResetClicked}
                >Factory Reset</a
            >
        </div>
        <div
            class="w-full flex flex-col items-start gap-4 text-textPrimary dark:text-white dark:text-opacity-80"
        >
            <div class="flex flex-row gap-[14px] justify-start">
                <div>
                    <Switch
                        checked={telemetryConsent}
                        onChanged={(enabled) => {
                            getSettingsService().setSetting(
                                SETTING_TELEMETRY_CONSENT,
                                enabled
                            );
                            telemetryConsent = enabled;
                        }}
                    />
                </div>
                <p class="text-sm font-normal text-left">
                    Share anonymous detection and device data with Malwarebytes
                </p>
            </div>
        </div>
    </div>
</div>

<ConfirmModal
    title="Factory reset"
    message="Are you sure you want to reset your Browser Guard installation?"
    confirmLabel="Yes, reset"
    open={showFactoryResetConfirmation}
    onConfirm={() => {
        sendBackgroundMessage({
            type: MSG_RESET,
            payload: null,
        });
    }}
/>

<style>
    a {
        @apply text-mbPrimary font-normal text-sm;
    }

    .spin {
        animation: rotation 1s infinite linear;
        transform-origin: center center;
    }

    @media (prefers-color-scheme: dark) {
        a {
            color: #7a95e3;
        }
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
