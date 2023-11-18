<script lang="ts">
    import {fade, slide} from "svelte/transition";
    import {flip} from "svelte/animate";
    import {toasts, removeToast} from "./toasts-store";

    // // @ts-ignore
    import CheckMarkWhiteIcon from "@/ui/svgs/CheckMarkWhiteIcon.svelte";
</script>

<div class="toasts-wrapper flex flex-row items-center justify-center w-full">
    {#each $toasts as toast (toast.message)}
        <div
            class="alert flex flex-row items-center justify-start gap-4 txt-break text-sm font-medium bg-black text-white rounded-[100px] px-5 py-3 z-50 min-w-fit max-w-[400px] w-fit"
        >
            <div class="icon">
                <CheckMarkWhiteIcon />
            </div>

            <div class="content">{toast.message}</div>
        </div>
    {/each}
</div>

<style>
    .toasts-wrapper {
        position: fixed;
        z-index: 999999;
        bottom: 50%;
        display: block;
        text-align: center;
        pointer-events: none;
    }

    .toasts-wrapper .alert {
        text-align: left;
        pointer-events: auto;
        box-shadow: 0px 2px 5px 0px var(--shadowColor);
        margin: 0 auto;
    }
</style>
