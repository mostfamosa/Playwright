<script lang="ts">
    import CheckmarkIcon from "@/ui/svgs/CheckmarkIcon.svelte";

    import {ExclusionType} from "@/domain/types/exclusion";

    import {Checkbox} from "flowbite-svelte";
    import {fade} from "svelte/transition";

    export let label: string | undefined = undefined;
    export let value: ExclusionType;
    export let group: ExclusionType[];
</script>

<Checkbox bind:group custom {value}>
    <div
        class="flex flex-row items-center gap-[10px] transition-all duration-150 py-[6px] px-[14px] font-medium text-sm bg-[#DCDDE0] dark:bg-grayNeutral70 rounded-[50px] cursor-pointer peer-checked:bg-mbPrimary-100 peer-checked:text-mbPrimary dark:peer-checked:bg-mbPrimaryDark dark:peer-checked:text-bgDark"
    >
        {#if group.includes(value)}
            <div class="w-4 h-4" transition:fade={{duration: 150}}>
                <CheckmarkIcon />
            </div>
        {/if}
        {label}
    </div>
</Checkbox>
