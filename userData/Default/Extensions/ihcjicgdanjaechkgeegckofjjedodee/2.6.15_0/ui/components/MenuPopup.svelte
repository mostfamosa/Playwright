<script lang="ts">
    import {link} from "svelte-spa-router";

    import ThreeDotMenuIcon from "@/ui/svgs/ThreeDotMenuIcon.svelte";

    import type {MenuPopupItem} from "./popup";

    // TODO: calculate position to bottom or top of the screen and compute placement automatically
    export let highlightOnHover = false;
    export let items: MenuPopupItem[];
    export let verticalPlacement: "top" | "bottom" = "bottom";
    const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    let showPopup = false;

    function handleFocusOut({relatedTarget, currentTarget}) {
        // use "focusout" event to ensure that we can close the dropdown when clicking outside or when we leave the dropdown with the "Tab" button
        if (
            relatedTarget instanceof HTMLElement &&
            currentTarget.contains(relatedTarget)
        ) {
            return; // check if the new focus target doesn't present in the dropdown tree (exclude ul\li padding area because relatedTarget, in this case, will be null)
        }
        showPopup = false;
    }

    function closePopup() {
        showPopup = false;
    }

    function addCloseListener() {
        // fallback to close the popup on safari
        setTimeout(() => {
            document.addEventListener("click", closePopup, {once: true});
        }, 0);
    }
</script>

<div class="relative w-6 h-6" on:focusout={handleFocusOut}>
    <button
        id="menu-button"
        class="group block"
        on:focusout={handleFocusOut}
        on:click={() => {
            showPopup = !showPopup;
            addCloseListener();
        }}
    >
        {#if highlightOnHover}
            <ThreeDotMenuIcon
                class="w-6 h-6 block group-hover:hidden"
                isActive={false}
            />
            <ThreeDotMenuIcon
                class="w-6 h-6 hidden group-hover:block"
                isActive={true}
            />
        {:else}
            <ThreeDotMenuIcon class="w-6 h-6" isActive={false} />
        {/if}
    </button>
    <div
        on:focusout={handleFocusOut}
        class="relative dropdown w-48 {showPopup ? '' : 'hidden'} {isDarkMode
            ? 'dark'
            : ''}"
        style={verticalPlacement === "top" ? "top: -24px;" : ""}
    >
        {#each items as item}
            {#if !!item.href && item.href !== "#"}
                <a
                    use:link
                    href={item.href}
                    on:click={closePopup}
                    class="dropdown-item {item.active
                        ? 'active'
                        : ''} {isDarkMode ? 'dark' : ''}">{item.label}</a
                >
            {:else if !!item.onClick}
                <button
                    on:click={() => {
                        if (item.onClick) {
                            item.onClick();
                        }

                        closePopup();
                    }}
                    class="dropdown-item {item.active
                        ? 'active'
                        : ''} {isDarkMode ? 'dark' : ''}">{item.label}</button
                >
            {/if}
        {/each}
    </div>
</div>

<style>
    .dropdown {
        @apply bg-white border border-grayNeutral95 rounded-lg shadow-md absolute z-10 p-2 right-2;
    }

    .dropdown.dark {
        @apply bg-bgDark border-grayNeutral40;
    }

    .dropdown-item {
        @apply flex flex-row w-full py-3 px-3 cursor-pointer text-sm font-normal rounded-lg;
    }

    .dropdown-item.active {
        @apply bg-mbPrimary-50;
    }

    .dropdown-item.dark.active {
        @apply bg-bgSecondaryDark;
    }

    .dropdown-item:hover:not(.active) {
        @apply bg-gray-100;
    }

    .dropdown-item.dark:hover:not(.active) {
        @apply bg-bgSecondaryDark;
    }

    .dropdown .divider {
        height: 1px;
        @apply w-full mx-1 bg-grayNeutral95;
    }

    .dropdown.dark .divider {
        @apply bg-grayNeutral40;
    }
</style>
