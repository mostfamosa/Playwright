<script lang="ts">

    import EventPageBGLogo from "@/ui/svgs/EventPageBGLogo.svelte";
    import BlockPageWarnIcon from "@/ui/svgs/BlockPageWarnIcon.svelte";
    import BlockPageBackArrowIcon from "@/ui/svgs/BlockPageBackArrowIcon.svelte";
    import LevelUpIllustration from "@/ui/svgs/LevelUpIllustration.svelte";
    import LearnMoreInfoIcon from "@/ui/svgs/LearnMoreInfoIcon.svelte";

    import Tailwind from "@/ui/Tailwind.svelte";
    import PrimaryButton from "@/ui/components/PrimaryButton.svelte";
    import {Checkbox} from "flowbite-svelte";
    import {onMount} from "svelte";
    import {
        excludeTemporary,
        getExclusionConst,
        humanReadableSubType,
        templateParameters,
        typesAsPlural,
        updateAllowListViaMessage,
    } from "./helpers";
    import {truncate} from "@/utils/utils.js";
    import {chrome} from "@/utils/typed-polyfill";

    let params;
    let blockedUrl = "";
    let continueAlways = false;
    let blockReason = "";
    let versionStr = "";

    onMount(() => {
        console.debug("BLOCK PAGE");
        params = templateParameters();
        console.debug("BLOCK PAGE PARAMS: ", params);

        updateBlockedUrlText();
        updateVersionStr();

        const typ =
            params.subtype && params.subtype !== ""
                ? humanReadableSubType(params)
                : typesAsPlural(params.type);
        blockReason = chrome.i18n.getMessage("websiteBlockHeader") + " " + typ;
    });

    function updateBlockedUrlText() {
        const host = truncate(params.host);
        blockedUrl = host;
    }

    function updateVersionStr() {
        const heuristics = `Heuristics: ${humanReadableSubType(params)}`;
        const version = chrome.runtime.getManifest().version;
        versionStr = `v${version} | ${heuristics}`;
    }

    function handleGoBackButton() {
        if (params.prevUrl && params.prevUrl.length > 0) {
            return window.location.replace(params.prevUrl);
        }

        if (window.history.length > 1) {
            return window.history.go(-1); // only -1 needed (not -2) it treats the malicious and the block as one entry now
        }

        // If we didn't open the block page in the same tab, we have to hunt for it
        let url;
        try {
            url = new URL(params.referrer);
        } catch (e) {
            // ignore
        }

        chrome.tabs.query({currentWindow: true, active: true}, (activeTabs) => {
            if (url) {
                chrome.tabs.query(
                    {currentWindow: true, url: `${url.origin}/*`},
                    (tabs) => {
                        if (tabs[0].index) {
                            chrome.tabs.highlight({tabs: tabs[0].index}, () => {
                                if (activeTabs[0].id) {
                                    chrome.tabs.remove(activeTabs[0].id);
                                }
                            });
                        }
                    }
                );
            } else if (activeTabs[0].id) {
                chrome.tabs.remove(activeTabs[0].id);
            }
        });
    }

    function handleContinueButton() {
        console.debug("BLOCK_PAGE: Continue ", {
            continueAlways,
            url: params.url,
        });
        let exclusionConst = getExclusionConst(params.type, params);
        if (continueAlways) {
            updateAllowListViaMessage(params, exclusionConst, continueAlways);
        } else {
            excludeTemporary(exclusionConst, params, false);
        }
    }
</script>

<Tailwind />
<main
    class="flex flex-col w-full h-full bg-white dark:bg-bgDark pb-8 text-[#1C1B1F] dark:text-white dark:text-opacity-80"
>
    <!-- Header at the top -->
    <div
        class="w-full flex flex-row items-center justify-center border-b border-b-gray-300 dark:border-b-grayNeutral40"
    >
        <div class="w-[776px] py-4 flex flex-row items-start">
            <EventPageBGLogo />
        </div>
    </div>

    <div class="flex flex-col w-[776px] justify-center mt-14 ml-auto mr-auto">
        <div class="flex flex-col w-full items-start justify-start gap-8">
            <h1 class="text-lg text-[22px] font-medium">
                Website blocked due to malware
            </h1>
            <!--Block details-->
            <div class="flex flex-col text-sm font-normal">
                <div class="flex flex-row gap-1">
                    <span>Website blocked</span><strong>{blockedUrl}</strong>
                </div>
                <!-- TODO: handle for safari -->
                <span>{versionStr}</span>
                <span class="mt-2"
                    >Malwarebytes Browser Guard blocked this page because it may
                    contain malware</span
                >
            </div>
            <!-- Alert -->
            <div
                class="flex flex-row w-full rounded-2xl py-4 px-8 gap-2 bg-[#FCDEDE] dark:bg-bgSecondaryDark"
            >
                <div>
                    <BlockPageWarnIcon />
                </div>
                <div class="text-left text-sm font-normal">
                    We strongly recommend you do not continue. You may be
                    putting your safety at risk by visiting this site. For more
                    information, visit <a
                        class="text-mbPrimary dark:text-mbPrimaryDark font-medium"
                        href="https://links.malwarebytes.com/support/browserguard/?guard=1&x-source=support"
                        target="_blank"
                        >Malwarebytes Support.
                    </a>
                </div>
            </div>
        </div>

        <div
            class="flex flex-col w-[352px] h-fit ml-auto mr-auto mt-10 items-center justify-start"
        >
            <PrimaryButton
                on:click={handleGoBackButton}
                class="flex flex-row w-full gap-3 text-white dark:text-bgDark font-bold text-sm justify-center"
            >
                <BlockPageBackArrowIcon />
                <span>Go back</span>
            </PrimaryButton>
            <div class="mb-8" />
            <PrimaryButton
                on:click={handleContinueButton}
                outlined
                class="flex flex-row w-full gap-3 font-bold text-sm justify-center"
            >
                Continue to this website
            </PrimaryButton>
            <div class="mb-4" />
            <Checkbox
                bind:checked={continueAlways}
                class="text-sm font-normal text-mbPrimary focus:ring-mbPrimary-200 
                dark:text-mbPrimaryDark dark:focus:ring-mbPrimaryDark-700 dark:focus:ring-opacity-30"
            >
                <span
                    class="text-[#1C1B1F] dark:text-white dark:text-opacity-80"
                    >Do not block this site again</span
                >
            </Checkbox>
        </div>

        <div
            class="w-full border-b border-gray-300 dark:border-b-grayNeutral40 my-14"
        />

        <div
            class="rounded-2xl bg-[#F6F7F7] dark:bg-bgSecondaryDark flex flex-row items-center p-8 gap-4"
        >
            <div class="flex flex-col items-start gap-6">
                <div class="flex flex-col items-start gap-6 h-fit">
                    <h3 class="font-medium text-lg text-[22px]">
                        Level up your secuity
                    </h3>
                    <div class="text-left text-sm font-normal">
                        Cyberthreats don't stop at your browser. Upgrade your
                        protection with <br /><a
                            href="https://malwarebytes.com/premium"
                            target="_blank"
                            class="font-medium text-mbPrimary dark:text-mbPrimaryDark"
                            >Malwarebytes Premium</a
                        > and secure all your data and devices.
                    </div>
                </div>
                <PrimaryButton
                    outlined
                    class="w-fit"
                    on:click={() => {
                        window.open(
                            "https://malwarebytes.com/premium",
                            "_blank"
                        );
                    }}
                >
                    Get started
                </PrimaryButton>
            </div>
            <div>
                <LevelUpIllustration />
            </div>
        </div>

        <div
            class="mt-14 flex flex-row items-center w-full gap-2 justify-start"
        >
            <LearnMoreInfoIcon  />
            <span class="font-normal text-sm"
                >To learn more about cybersecurity visit our page <a
                    class="font-medium text-mbPrimary dark:text-mbPrimaryDark"
                    href="https://www.malwarebytes.com/cybersecurity"
                    target="_blank">Cybersecurity basics & protection</a
                ></span
            >
        </div>
    </div>
</main>
