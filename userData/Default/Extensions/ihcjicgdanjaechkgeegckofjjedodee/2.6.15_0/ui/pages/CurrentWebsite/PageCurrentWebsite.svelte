<script lang="ts">
    import {onMount} from "svelte";
    import ProtectionControls from "./ProtectionControls.svelte";
    import ProtectionStatus from "./ProtectionStatus.svelte";
    import {getProtectionService} from "@/domain/protection-service";
    import {
        EXCLUSION_ADS,
        EXCLUSION_MALWARE,
        EXCLUSION_SCAMS,
        ExclusionType,
    } from "@/domain/types/exclusion";
    import {getCurrentTabData} from "@/app/scripts/ui-utils/ui-utils.js";
    import EmptyPageView from "./EmptyPageView.svelte";
    import {getExclusionService} from "@/domain/exclusion-service";
    import {domain, urlHost} from "@/utils/utils.js";

    const protectionService = getProtectionService();
    const exclusionService = getExclusionService();

    let currentUrl: string | undefined = undefined;
    let currentHost = "";
    let currentUrlIsValid = false;

    let protectionStatus: Map<ExclusionType, boolean> = new Map();

    $: isEmptyPage = currentHost === undefined || currentHost === "";

    $: adsProtectionEnabled = protectionStatus.get(EXCLUSION_ADS) ?? false;
    $: malwareProtectionEnabled =
        protectionStatus.get(EXCLUSION_MALWARE) ?? false;
    $: scamProtectionEnabled = protectionStatus.get(EXCLUSION_SCAMS) ?? false;
    $: isProtectionActive =
        adsProtectionEnabled &&
        malwareProtectionEnabled &&
        scamProtectionEnabled;
    let isKillswitchActive = false;

    $: if (currentHost) {
        getCurrentWebsiteExclusions();
    }

    onMount(async () => {
        try {
            initTabInfo();
        } catch (err) {}
    });

    async function initTabInfo() {
        const tabInfo = await getTabInfo();
        currentUrl = tabInfo.url;
        currentHost = urlHost(tabInfo.host);
        currentUrlIsValid = tabInfo.isValid;
        if (currentUrl !== undefined && currentUrl.trim() === "") {
            currentUrl = undefined;
            currentHost = "";
            currentUrlIsValid = false;
        }
        currentHost = currentHost.replace(/^(www\.)/,"");
    }

    function getTabInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            getCurrentTabData(
                (validatedData) => {
                    resolve(validatedData);
                },
                (onErr) => {
                    console.error("Error getting current tab data", onErr);
                    reject(onErr);
                }
            );
        });
    }

    async function getCurrentWebsiteExclusions() {
        let isAdsExcluded = false;
        let isMalwareExcluded = false;
        let isScamsExcluded = false;

        const exclusions = await exclusionService.getExclusionsForHost(
            currentHost
        );

        console.debug("Current website exclusions", {currentHost, exclusions});
        if (!exclusions) {
            isAdsExcluded = false;
            isMalwareExcluded = false;
            isScamsExcluded = false;
        } else {
            isAdsExcluded = exclusions.exclusions.some(
                (exclusion) => exclusion === EXCLUSION_ADS
            );
            isMalwareExcluded = exclusions.exclusions.some(
                (exclusion) => exclusion === EXCLUSION_MALWARE
            );
            isScamsExcluded = exclusions.exclusions.some(
                (exclusion) => exclusion === EXCLUSION_SCAMS
            );
            console.debug("PageCurrentWebsite: Current website exclusions", {
                isAdsExcluded,
                isMalwareExcluded,
                isScamsExcluded,
            });
        }

        const protection = await protectionService.getProtectionStatus();
        const adsKillswitchOn = (protection.get(EXCLUSION_ADS) ?? true) === false;
        const malwareKillswitchOn =
            (protection.get(EXCLUSION_MALWARE) ?? true) === false;
        const scamsKillswitchOn =
            (protection.get(EXCLUSION_SCAMS) ?? true) === false;
        isKillswitchActive = adsKillswitchOn || malwareKillswitchOn || scamsKillswitchOn;

        protectionStatus.set(EXCLUSION_ADS, !isAdsExcluded && !adsKillswitchOn);
        protectionStatus.set(
            EXCLUSION_MALWARE,
            !isMalwareExcluded && !malwareKillswitchOn
        );
        protectionStatus.set(
            EXCLUSION_SCAMS,
            !isScamsExcluded && !scamsKillswitchOn
        );
        protectionStatus = new Map(protectionStatus);
    }

    // TODO protection toggles should update allow list
    async function onAdsProtectionToggled(enabled: boolean) {
        try {
            if (enabled) {
                await exclusionService.removeExclude(
                    currentHost,
                    [EXCLUSION_ADS],
                    true
                );
            } else {
                await exclusionService.exclude(currentHost, [EXCLUSION_ADS]);
            }
            protectionStatus.set(EXCLUSION_ADS, enabled);
        } catch (err) {
            protectionStatus.set(EXCLUSION_ADS, false);
            console.error(err);
        } finally {
            protectionStatus = new Map(protectionStatus);
        }
    }

    async function onMalwareProtectionToggled(enabled: boolean) {
        try {
            if (enabled) {
                await exclusionService.removeExclude(
                    currentHost,
                    [EXCLUSION_MALWARE],
                    true
                );
            } else {
                await exclusionService.exclude(currentHost, [
                    EXCLUSION_MALWARE,
                ]);
            }
            protectionStatus.set(EXCLUSION_MALWARE, enabled);
        } catch (err) {
            console.error(err);
            protectionStatus.set(EXCLUSION_MALWARE, false);
        } finally {
            protectionStatus = new Map(protectionStatus);
        }
    }

    async function onScamsProtectionToggled(enabled: boolean) {
        try {
            if (enabled) {
                await exclusionService.removeExclude(
                    currentHost,
                    [EXCLUSION_SCAMS],
                    true
                );
            } else {
                await exclusionService.exclude(currentHost, [EXCLUSION_SCAMS]);
            }
            protectionStatus.set(EXCLUSION_SCAMS, enabled);
        } catch (err) {
            console.error(err);
            protectionStatus.set(EXCLUSION_SCAMS, false);
        } finally {
            protectionStatus = new Map(protectionStatus);
        }
    }

    async function onRemoveFromAllowListClicked() {
        await getExclusionService().removeExclude(
            currentHost,
            [EXCLUSION_ADS, EXCLUSION_MALWARE, EXCLUSION_SCAMS],
            true
        );
        await getCurrentWebsiteExclusions();
    }
</script>

<div class="flex flex-row mt-4 gap-6 w-full h-full">
    <div class="protection-controls">
        <ProtectionControls
            bind:currentUrlIsValid
            {adsProtectionEnabled}
            {malwareProtectionEnabled}
            {scamProtectionEnabled}
            {onAdsProtectionToggled}
            {onMalwareProtectionToggled}
            {onScamsProtectionToggled}
        />
    </div>
    <div class="protection-status">
        {#if isEmptyPage}
            <EmptyPageView />
        {:else}
            <ProtectionStatus
                bind:currentHost
                {isProtectionActive}
                {isKillswitchActive}
                {onRemoveFromAllowListClicked}
            />
        {/if}
    </div>
</div>

<style>
    .protection-controls {
        @apply flex w-2/5;
    }
    .protection-status {
        @apply flex w-3/5 h-full;
    }
</style>
