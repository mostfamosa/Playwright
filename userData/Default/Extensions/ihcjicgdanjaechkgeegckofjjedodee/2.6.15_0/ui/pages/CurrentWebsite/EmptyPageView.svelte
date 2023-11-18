<script lang="ts">
    import EmptyPageImage from "@/ui/svgs/EmptyPageImage.svelte";
</script>

<div
    class="flex flex-col items-center justify-start px-6 py-6 w-full h-full bg-bgSecondary dark:bg-bgSecondaryDark rounded-2xl"
>
    <h4 class="text-base font-semibold mb-4">Empty page (no website)</h4>
    <div class="flex flex-col items-center gap-4 mb-6">
        <EmptyPageImage />
        <span class="text-sm text-textSecondary dark:text-white dark:text-opacity-80 font-normal">
            Sorry, we can't evaluate this type of page
        </span>
    </div>
</div>
