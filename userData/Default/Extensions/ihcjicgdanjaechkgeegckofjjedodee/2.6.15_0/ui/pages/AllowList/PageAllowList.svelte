<script lang="ts">
    import {querystring} from "svelte-spa-router";
    import {onMount} from "svelte";
    import PrimaryButton from "@/ui/components/PrimaryButton.svelte";
    import {MenuPopupItem} from "@/ui/components/popup";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import MenuPopup from "@/ui/components/MenuPopup.svelte";
    import {
        EXCLUSION_ADS,
        Exclusion,
        ExclusionType,
        exclusionToFriendlyName,
    } from "@/domain/types/exclusion";
    import AddWebsiteModal from "./AddWebsiteModal.svelte";
    import {addInfoToast, addSuccessToast} from "@/ui/components/toasts-store";
    import {getExclusionService} from "@/domain/exclusion-service";
    import {getCurrentTabData} from "@/app/scripts/ui-utils/ui-utils.js";
    import {domain} from "@/utils/utils.js";
    import ConfirmModal from "@/ui/components/app/ConfirmModal.svelte";

    import AddIcon from "@/ui/svgs/AddIcon.svelte";
    import SearchIcon from "@/ui/svgs/SearchIcon.svelte";
    import AllowListSearchCloseIcon from "@/ui/svgs/AllowListSearchCloseIcon.svelte";
    import AllowListSearchActiveIcon from "@/ui/svgs/AllowListSearchActiveIcon.svelte";

    const queryParams = new URLSearchParams($querystring);
    const exclusionService = getExclusionService();

    let exclusions: Exclusion[] = [];
    let showAddModal = false;
    let showConfirmDeleteAllModal = false;
    let showConfirmDeleteModal = false;
    let websiteToDel = -1;
    let searchMode = false;
    let searchQuery = "";

    $: filteredExclusions = exclusions.filter((exclusion) => {
        if (searchQuery === "") {
            return true;
        }
        return exclusion.website.toLowerCase().includes(searchQuery);
    });

    const tableHeaderPopupItems: MenuPopupItem[] = [
        {
            label: "Remove all websites",
            onClick: () => {
                showConfirmDeleteAllModal = true;
            },
        },
    ];

    onMount(() => {
        if (queryParams.get("showAddModal") === "true") {
            setTimeout(() => {
                showAddModal = true;
            }, 800);
        }

        console.debug("allow list page mounted");
        loadAllowList();
    });

    $: tableEntryPopupItems = exclusions.map((exclusion, idx) => {
        return {
            label: "Delete website",
            onClick: () => {
                websiteToDel = idx;
                showConfirmDeleteModal = true;
            },
        };
    });

    async function loadAllowList() {
        console.debug("loading allow list");
        exclusions = await exclusionService.getAllExclusions();
        console.debug("loaded exclusions", exclusions);
    }

    async function addItemClicked() {
        showAddModal = true;
    }

    async function removeAllClicked() {
        console.debug("removing all exclusions");
        await exclusionService.removeAllExclusions();
        exclusions = [];
        addSuccessToast("All websites have been deleted", 2000);
        loadAllowList();
    }

    async function removeItemClicked(idx: number) {
        try {
            const exclusion = exclusions[idx];
            console.debug("removing exclusion", exclusion);
            const success = await exclusionService.removeExclude(
                exclusion.website,
                exclusion.exclusions,
                true
            );
            if (!success) {
                addInfoToast(
                    "The website was not removed from the Allow List",
                    3000
                );
                return;
            }

            addSuccessToast(
                "The website was removed from the Allow List",
                3000
            );
            exclusions = exclusions.filter((_, i) => i !== idx);
            loadAllowList();
        } catch (e) {
            console.error(e);
        }
    }

    async function onWebsiteAdded(
        event: CustomEvent<{url: string; protections: ExclusionType[]}>
    ) {
        await exclusionService.exclude(
            event.detail.url,
            event.detail.protections
        );
        addInfoToast("The website was added to the Allow List", 2000);
        exclusions = [
            ...exclusions,
            {
                website: event.detail.url,
                exclusions: event.detail.protections,
            },
        ];
        loadAllowList();
    }

    // function onSearch(event: Event) {
    //     const target = event.target as HTMLInputElement;
    //     const search = target.value.toLowerCase();
    //     if (search === "") {
    //         loadAllowList();
    //         return;
    //     }

    //     exclusions = exclusions.filter((exclusion) => {
    //         return exclusion.website.toLowerCase().includes(search);
    //     });
    // }
</script>

<div
    class="flex flex-col justify-start items-start w-full h-full pt-6 dark:text-white dark:text-opacity-80"
>
    <p
        class="text-sm text-textPrimary dark:text-white dark:text-opacity-80 font-normal text-left mb-4"
    >
        To customize protection for a website, enter its URL or IP address, and
        then select the protection(s) you would like to disable
    </p>
    <div class="flex flex-row w-full justify-end">
        <PrimaryButton class="gap-2" on:click={addItemClicked}>
            <AddIcon class="w-4 h-4" />
            <span>Add a website</span>
        </PrimaryButton>
    </div>

    <div class="flex flex-col mt-6 w-full h-full">
        <div class="overflow-y-scroll max-h-[330px]">
            <Table class="w-full" divClass="relative overflow-x-auto h-[330px]">
                <TableHead
                    hoverable={true}
                    defaultRow={false}
                    style="font-weight: 500 !important;"
                    class="{searchMode
                        ? 'bg-white dark:bg-transparent'
                        : 'bg-bgSecondary dark:bg-grayNeutral40'} normal-case text-textPrimary dark:text-white dark:text-opacity-80 text-base border-b border-grayNeutral95 dark:border-transparent"
                >
                    {#if !searchMode}
                        <TableHeadCell
                            colspan="2"
                            style="font-weight: 500 !important; padding-left: 16px !important;"
                            class="px-0 py-4 text-left align-middle"
                        >
                            URL / IP address
                        </TableHeadCell>
                        <TableHeadCell
                            style="font-weight: 500 !important"
                            class="px-0 py-4 text-left align-middle"
                            colspan="3"
                        >
                            <div class="flex flex-row w-full justify-between">
                                <span class="min-w-[150px]">Allow</span>
                                <button on:click={() => (searchMode = true)}>
                                    <SearchIcon />
                                </button>
                            </div>
                        </TableHeadCell>
                        <TableHeadCell
                            colspan="1"
                            style="font-weight: 500 !important"
                            class="py-4 px-2 text-center align-middle"
                        >
                            <div
                                class="flex flex-row w-full justify-center items-center"
                            >
                                <MenuPopup items={tableHeaderPopupItems} />
                            </div>
                        </TableHeadCell>
                    {:else}
                        <th colspan="6" class="py-2 px-2 pb-[10px]">
                            <div
                                class="w-full rounded-[100px] py-[6px] px-4 flex flex-row items-center border border-mbPrimary dark:border-mbPrimaryDark ring ring-mbPrimary-200 dark:ring-mbPrimaryDark-700 dark:ring-opacity-30"
                            >
                                <input
                                    type="text"
                                    placeholder="search..."
                                    class="p-0 flex grow border-none w-full ring-0 focus:ring-0 focus:outline-none text-sm placeholder:text-sm text-textPrimary dark:text-white dark:text-opacity-80 dark:bg-transparent font-normal"
                                    bind:value={searchQuery}
                                />
                                <button
                                    on:click={() => (searchMode = false)}
                                    class="flex flex-row justify-center items-center"
                                >
                                    <AllowListSearchCloseIcon />
                                </button>
                                <div
                                    class="w-[1px] h-5 bg-gray-600 dark:bg-[#515565] ml-3 mr-3"
                                />
                                <AllowListSearchActiveIcon />
                            </div>
                        </th>
                    {/if}
                </TableHead>
                <TableBody tableBodyClass="divide-y">
                    {#each filteredExclusions as exclusion, idx}
                        <TableBodyRow
                            class="border-b last:border-b-0 bg-white dark:bg-bgDark dark:border-grayNeutral40"
                        >
                            <TableBodyCell
                                colspan="2"
                                class="text-left pl-4 px-0 font-normal text-textPrimary dark:text-white dark:text-opacity-80"
                                style="padding-left: 16px !important;"
                                >{exclusion.website}</TableBodyCell
                            >
                            <TableBodyCell
                                colspan="3"
                                class="text-left px-0 font-normal text-textPrimary dark:text-white dark:text-opacity-80"
                            >
                                <span class="min-w-[150px]">
                                    {exclusion.exclusions
                                        .map((e) => exclusionToFriendlyName(e))
                                        .join(", ")}
                                </span>
                            </TableBodyCell>
                            <TableBodyCell
                                colspan="1"
                                class="text-center px-2 font-normal text-textPrimary dark:text-white dark:text-opacity-80"
                            >
                                <div
                                    class="flex flex-row w-full justify-center items-center"
                                >
                                    <MenuPopup
                                        items={tableEntryPopupItems.filter(
                                            (it, i) => i === idx
                                        )}
                                    />
                                </div>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
    </div>
</div>

<AddWebsiteModal bind:open={showAddModal} on:websiteAdded={onWebsiteAdded} />
<ConfirmModal
    bind:open={showConfirmDeleteAllModal}
    title="Delete all websites"
    message="Are you sure you want to delete all of the websites?"
    confirmLabel="Yes, delete"
    onConfirm={removeAllClicked}
/>
<ConfirmModal
    bind:open={showConfirmDeleteModal}
    title="Delete website"
    message="Are you sure you want to delete this website?"
    confirmLabel="Yes, delete"
    onConfirm={() => {
        removeItemClicked(websiteToDel);
        showConfirmDeleteModal = false;
        websiteToDel = -1;
    }}
/>
