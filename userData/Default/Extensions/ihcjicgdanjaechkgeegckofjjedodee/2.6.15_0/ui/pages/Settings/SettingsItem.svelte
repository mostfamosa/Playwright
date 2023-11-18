<script lang="ts">
    import Switch from "@/ui/components/Switch.svelte";

    export let title: string;
    export let description: string;
    export let enabled: boolean;
    export let isSubItem: boolean = false;
    export let onChanged: ((enabled: boolean) => void) | undefined = undefined;
</script>

<div
    class="flex flex-col gap-2 items-start justify-center {isSubItem
        ? 'pl-6'
        : ''}"
>
    <h3 class="font-medium text-base">{title}</h3>
    <div class="flex flex-row items-center justify-between w-full gap-6">
        <p class="font-normal text-sm text-left">{description}</p>
        <Switch checked={enabled} {onChanged} />
    </div>
</div>
