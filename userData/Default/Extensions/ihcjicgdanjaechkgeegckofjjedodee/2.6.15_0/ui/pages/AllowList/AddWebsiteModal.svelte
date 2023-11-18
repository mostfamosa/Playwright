<script lang="ts">
    import {Modal} from "flowbite-svelte";

    // // @ts-ignore
    // import LinkIcon from "../../../assets/images/light/link.svg";
    // // @ts-ignore
    // import LinkIconDark from "../../../assets/images/dark/link.svg";
    import LinkIcon from "@/ui/svgs/LinkIcon.svelte";

    import {getCurrentTabData} from "@/app/scripts/ui-utils/ui-utils.js";
    import {domain, isValidUrl, urlHost} from "@/utils/utils.js";
    import {
        EXCLUSION_ADS,
        EXCLUSION_MALWARE,
        EXCLUSION_SCAMS,
        ExclusionType,
    } from "@/domain/types/exclusion";
    import ProtectionPill from "./ProtectionPill.svelte";
    import PrimaryButton from "@/ui/components/PrimaryButton.svelte";
    import {createEventDispatcher, onMount} from "svelte";
    import {fade, scale} from "svelte/transition";

    export let open;

    let modalBody;
    let dispatch = createEventDispatcher();
    let websiteInput = "";
    let validWebsite = "";
    let protections: Record<string, ExclusionType> = {
        "Ads / Trackers": EXCLUSION_ADS,
        Malware: EXCLUSION_MALWARE,
        Scams: EXCLUSION_SCAMS,
    };
    let selectedProtections: ExclusionType[] = [];
    const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    $: if (open === false) {
        websiteInput = "";
        validWebsite = "";
        selectedProtections = [];
    }

    $: {
        if (isValidUrl(`https://${websiteInput}`)) {
            validWebsite = urlHost(websiteInput);
        }
    }

    $: if (isDarkMode && open === true && modalBody) {
        console.debug("modalBody", modalBody);
        const modalBodyParent = modalBody.parentNode.parentNode;
        modalBodyParent.style.backgroundColor = "#1C1B1F";
    }

    async function setUrlToCurrentWebsite() {
        getCurrentTabData(
            (validatedData) => {
                let host = validatedData.host.replace(/^(www\.)/, "");
                // replace leading http:// or https://
                host = host.replace(/^(http(s)?:\/\/)/, "");
                // const host = domain(validatedData.host);
                websiteInput = host;
            },
            (onErr) => {
                console.error("Error getting current tab data", onErr);
            }
        );
    }

    function addWebsite() {
        dispatch("websiteAdded", {
            url: validWebsite,
            protections: selectedProtections,
        });
    }
</script>

<!-- Add website modal -->
<Modal
    bind:open    
    autoclose
    outsideclose
    dialogClass="fixed top-0 left-0 right-0 h-modal md:inset-0 md:h-full z-50 w-full p-10 flex"
>
    <div bind:this={modalBody} id="modal-body" class="modal-body mt-4 pl-4 pr-4 pb-4 flex flex-col w-full gap-6">
        <h2 class="text-textPrimary dark:text-white dark:text-opacity-95">
            Add a website to your Allow List
        </h2>
        <!-- URL/IP selector-->
        <div class="flex flex-col w-full items-start gap-1">
            <label
                for="website-input"
                class="text-sm text-textPrimary dark:text-white dark:text-opacity-95"
                >Add a URL or IP address</label
            >
            <div
                class="flex flex-row pr-4 items-center w-full border border-grayNeutral70 rounded-10px"
            >
                <input
                    name="website-input"
                    type="text"
                    placeholder="website.com or 123.45.67.89"
                    class="flex grow border-none dark:bg-transparent w-full h-full text-sm placeholder:text-sm text-textPrimary dark:text-white dark:text-opacity-95 placeholder:text-gray-500 dark:placeholder:text-white dark:placeholder:text-opacity-50 pl-4 py-10px rounded-10px ring-0 focus:ring-0 focus:outline-none"
                    bind:value={websiteInput}
                />
                <button on:click={setUrlToCurrentWebsite}>
                    <LinkIcon />                    
                </button>
            </div>
        </div>

        <!-- protection selector -->
        <div class="flex flex-col w-full items-start gap-1">
            <p
                class="text-sm text-textPrimary dark:text-white dark:text-opacity-95"
            >
                Choose protections to disable
            </p>
            <div class="flex flex-row gap-4">
                {#each Object.keys(protections) as key}
                    <ProtectionPill
                        bind:group={selectedProtections}
                        value={protections[key]}
                        label={key}
                    />
                {/each}
            </div>
        </div>

        <!-- buttons -->
        <div class="flex flex-row w-full justify-end gap-4">
            <PrimaryButton
                outlined
                on:click={() => {
                    open = false;
                }}
            >
                Cancel
            </PrimaryButton>
            <PrimaryButton
                on:click={addWebsite}
                disabled={!(
                    selectedProtections.length > 0 &&
                    validWebsite.trim().length > 0
                )}
            >
                Add to list
            </PrimaryButton>
        </div>
    </div>
</Modal>

<style>
    .modal-body h2 {
        font-size: 22px;
        line-height: 28px;
        font-weight: 500;
    }
</style>
