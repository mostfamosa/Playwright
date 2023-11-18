<script lang="ts">
    import {Button} from "flowbite-svelte";
    export let text: string | undefined = undefined;
    // export let isLoading: boolean | undefined = undefined;
    export let disabled = false;
    export let outlined = false;

    let classes = "";
    export {classes as class};
</script>

<Button
    class="{classes}  text-sm font-semibold rounded-3xl transition-colors duration-200 ease-in-out ring-0 focus:ring-0 
    {outlined
        ? '!bg-transparent border-mbPrimary text-mbPrimary hover:text-mbPrimary-800 hover:border-mbPrimary-800 dark:border-mbPrimaryDark dark:text-mbPrimaryDark dark:hover:text-mbPrimaryDark-800 dark:hover:border-mbPrimaryDark-800'
        : 'bg-mbPrimary text-white hover:bg-mbPrimary-800 dark:bg-mbPrimaryDark dark:hover:bg-mbPrimaryDark-800 dark:text-bgDark'}"
    on:click
    {disabled}
    outline={outlined}
>
    <slot />
    {#if text}
        {text}
    {/if}
</Button>
