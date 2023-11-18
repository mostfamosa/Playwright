<script lang="ts">
    
    import BGLogoIcon from "@/ui/svgs/BGLogoIcon.svelte";
    import CogIcon from "@/ui/svgs/CogIcon.svelte";

    import MenuPopup from "../MenuPopup.svelte";
    import type { MenuPopupItem } from "../popup";
    import TabHeader from "./TabHeader.svelte";
    import TabSwitcher from "./TabSwitcher.svelte";
    import {link, location} from "svelte-spa-router";

    const nonTabRoutes = ["/support", "/settings"];
    const menuItems: MenuPopupItem[] = [
        {
            label: "Support",
            href: "/support",
            active: $location == "/support",
        },
        {
            label: "Share extension",
            href: "#",
        },
    ];
</script>

<div class="flex flex-col">
    <div class="flex flex-row w-full py-5">
        <div>
            <BGLogoIcon />
        </div>
        <div class="flex flex-row w-full items-center justify-end space-x-6">
            <a use:link href="/settings" class="group w-5 h-5 flex">
                <CogIcon class="w-6 h-6 block group-hover:hidden" isActive={false} />
                <CogIcon class="w-6 h-6 hidden group-hover:block" isActive={true} />
            </a>            
            <MenuPopup items={menuItems} highlightOnHover />
        </div>
    </div>
    {#if !nonTabRoutes.includes($location)}
        <TabSwitcher />
    {:else}
        <TabHeader />
    {/if}
</div>
