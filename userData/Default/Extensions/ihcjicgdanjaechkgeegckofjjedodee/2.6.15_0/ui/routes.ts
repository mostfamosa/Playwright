import {wrap} from "svelte-spa-router/wrap";
import PageCurrentWebsite from "./pages/CurrentWebsite/PageCurrentWebsite.svelte";
import PageAllowList from "./pages/AllowList/PageAllowList.svelte";
import PageSupport from "./pages/PageSupport.svelte";
import PageSettings from "./pages/Settings/PageSettings.svelte";

export const routes = {
    "/current_website": PageCurrentWebsite,
    "/allow-list": PageAllowList,
    "/support": PageSupport,
    "/settings": PageSettings,
    "*": PageCurrentWebsite,
};
