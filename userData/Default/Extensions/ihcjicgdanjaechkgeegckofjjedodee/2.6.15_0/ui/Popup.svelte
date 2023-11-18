<script lang="ts">
    import Router from "svelte-spa-router";
    import Tailwind from "./Tailwind.svelte";
    import TopHeader from "./components/app/TopHeader.svelte";
    import {routes} from "./routes";
    import Toasts from "./components/Toasts.svelte";

    let currentTab = "current_website";

    $: console.log(currentTab);
</script>

<main class="container" style="width: 600px; height: 600px;">
    <!-- IMPORTANT FOR TAILWIND TO WORK -->
    <Tailwind />
    <!-- -->

    <div class="px-6 pb-6 w-full h-full flex flex-col bg-white dark:bg-bgDark dark:text-white dark:text-opacity-80">
        <TopHeader />

        <div class="w-full h-full pb-6">
            <Router {routes} />
        </div>

        <Toasts />
    </div>
</main>

<style>
</style>
