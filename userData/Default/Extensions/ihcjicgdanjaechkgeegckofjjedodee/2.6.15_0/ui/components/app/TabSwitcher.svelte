<script lang="ts">
    import CurrentWebsiteTabIcon from "@/ui/svgs/CurrentWebsiteTabIcon.svelte";
    import AllowListTabIcon from "@/ui/svgs/AllowListTabIcon.svelte";

    import {link, location} from "svelte-spa-router";

    console.debug($location);
    // export let activeTab = "current_website";
    let tabs = [
        {key: "current_website", name: "Current Website"},
        {key: "allow_list", name: "Allow List"},
    ];
</script>

<div class="w-full flex flex-row">
    <a
        use:link
        href="/current-website"
        class="link flex flex-row flex-grow items-center justify-center
            py-2 text-sm border-b-2 space-x-2 {`/current-website` ===
            $location || '/' === $location
            ? 'border-mbPrimary dark:border-mbPrimaryDark text-mbPrimary dark:text-mbPrimaryDark'
            : 'border-grayNeutral95 dark:border-grayNeutral40 text-grayNeutral50 dark:text-grayNeutral80'}"
    >
        {#if `/current-website` === $location || "/" === $location}
            <CurrentWebsiteTabIcon isActive={true} class="w-[16px] h-[16px]" />
        {:else}
            <CurrentWebsiteTabIcon isActive={false} class="w-[16px] h-[16px]" />
        {/if}
        <span class="font-semibold">Current website</span>
    </a>
    <a
        use:link
        href="/allow-list"
        class="link flex flex-row flex-grow items-center justify-center
            py-2 text-sm border-b-2 space-x-2 {`/allow-list` === $location
            ? 'border-mbPrimary dark:border-mbPrimaryDark text-mbPrimary dark:text-mbPrimaryDark'
            : 'border-grayNeutral95 dark:border-grayNeutral40 text-grayNeutral50 dark:text-grayNeutral80'}"
    >
        {#if `/allow-list` === $location}
            <AllowListTabIcon isActive={true} />
        {:else}
            <AllowListTabIcon isActive={false} />
        {/if}
        <span class="font-semibold">Allow list</span>
    </a>
</div>
