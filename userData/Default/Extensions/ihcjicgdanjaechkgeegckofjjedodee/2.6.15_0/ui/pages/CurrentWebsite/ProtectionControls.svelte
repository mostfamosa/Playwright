<script lang="ts">
    import Switch from "@/ui/components/Switch.svelte";

    export let currentUrlIsValid = false;
    export let adsProtectionEnabled: boolean;
    export let malwareProtectionEnabled: boolean;
    export let scamProtectionEnabled: boolean;
    export let onAdsProtectionToggled: (enabled: boolean) => void;
    export let onMalwareProtectionToggled: (enabled: boolean) => void;
    export let onScamsProtectionToggled: (enabled: boolean) => void;

</script>

<div class="flex flex-col w-full items-start justify-start pt-6 dark:text-white dark:text-opacity-80">
    {#if currentUrlIsValid}
        <h5 class="text-textPrimary font-semibold text-sm pb-4 dark:text-white dark:text-opacity-80">
            Protection for this website:
        </h5>

        <div class="flex flex-row w-full justify-between items-center py-4">
            <span class="text-sm font-normal text-textPrimary dark:text-white dark:text-opacity-80"
                >Ads / Trackers</span
            >
            <Switch
                checked={adsProtectionEnabled}
                onChanged={onAdsProtectionToggled}
            />
        </div>
        <div class="flex flex-row w-full justify-between items-center py-4">
            <span class="text-sm font-normal text-textPrimary dark:text-white dark:text-opacity-80">Malware</span>
            <Switch
                checked={malwareProtectionEnabled}
                onChanged={onMalwareProtectionToggled}
            />
        </div>
        <div class="flex flex-row w-full justify-between items-center py-4">
            <span class="text-sm font-normal text-textPrimary dark:text-white dark:text-opacity-80">Scams</span>
            <Switch
                checked={scamProtectionEnabled}
                onChanged={onScamsProtectionToggled}
            />
        </div>
    {:else}
        <p class="text-left text-sm font-normal">
            System pages are addresses which are part of the browser or an
            extension, we do not block content on these pages.
        </p>
    {/if}
</div>
