<script lang="ts">
    import {Modal} from "flowbite-svelte";
    import PrimaryButton from "../PrimaryButton.svelte";

    export let open: boolean = false;
    export let title: string;
    export let message: string;

    export let confirmLabel: string = "Confirm";
    export let cancelLabel: string = "Cancel";
    export let onConfirm: (() => void) | undefined;
    let modalBody;

    const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    $: if (isDarkMode && open === true && modalBody) {
        console.debug("modalBody", modalBody);
        const modalBodyParent = modalBody.parentNode.parentNode;
        modalBodyParent.style.backgroundColor = "#1C1B1F";
    }
</script>

<Modal
    outsideclose
    autoclose
    bind:open
    dialogClass="fixed top-0 left-0 right-0 h-modal md:inset-0 md:h-full z-50 w-full p-10 flex rounded-2xl"
>
    <div bind:this={modalBody} id="modal-body" class="mt-4 pl-4 pr-4 pb-4 flex flex-col w-full justify-center gap-6">
        <h2 class="text-textPrimary dark:text-white dark:text-opacity-95 font-medium">{title}</h2>
        <p class="text-textPrimary dark:text-white dark:text-opacity-95 font-normal text-sm text-left">{message}</p>
        <!-- buttons -->
        <div class="flex flex-row w-full justify-end gap-4">
            <PrimaryButton
                outlined
                on:click={() => {
                    open = false;
                }}
            >
                {cancelLabel}
            </PrimaryButton>
            <PrimaryButton on:click={onConfirm}>
                {confirmLabel}
            </PrimaryButton>
        </div>
    </div>
</Modal>

<style>
    h2 {
        font-size: 22px;
        line-height: 28px;
    }
</style>
