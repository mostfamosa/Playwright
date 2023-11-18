import {GetTabInfoResponse} from "@/utils/messaging/types";
import {getTabInfo} from "../helpers";
import {isAdProtectionActive, isHidden, recordBlockedAd} from "./ad-helpers";

export async function hideFacebookAds(pageUrl: string) {
    console.debug("FBA: Hiding facebook ads");
    let lang = "en";

    const malwarebytesClearFbAds = (tab: GetTabInfoResponse) => {
        const hyperFeedDivs = document.querySelectorAll(
            '#contentArea div[id^="hyperfeed_story_id_"]'
        );

        // @ts-ignore
        hyperFeedDivs.forEach((div: HTMLElement) => {
            if (
                div.innerText.includes("Sponsored") &&
                Array.from(div.getElementsByTagName("span")).some(
                    (span) => span.innerText === "Sponsored"
                ) && // User text is in a `p` tag, so just to ensure we don't hide someone's post because they used the word "Sponsored"
                !div.querySelector('div[role="textbox"]') && // this means the user is typing
                !isHidden(div)
            ) {
                recordBlockedAd(tab);
                return (div.style.display = "none");
            }

            const span = div.querySelector('a span[data-content="S"]');
            if (span) {
                const rect = span.getBoundingClientRect();
                if (rect.width > 0 || rect.height > 0) {
                    div.style.display = "none";
                }
            }
        });

        const sponsoredPagelet = document.getElementById("pagelet_ego_pane");
        if (
            sponsoredPagelet &&
            sponsoredPagelet.innerText.includes("Sponsored")
        ) {
            sponsoredPagelet.style.display = "none";
        }
    };

    const blockInitialSponsoredFeedItem = (tab: GetTabInfoResponse) => {
        // Remove sponsored posts
        const feedUnits = document.querySelectorAll('div[role^="feed"] > div');
        // @ts-ignore
        for (let feedUnit of feedUnits) {
            const hasSponsoredLink = checkForPaidFeedUnit(feedUnit);
            if (hasSponsoredLink && !isHidden(feedUnit)) {
                // @ts-ignore
                feedUnit.style.display = "none";
                recordBlockedAd(tab);
            }
        }
    };

    const checkForPaidFeedUnit = (feedUnit) => {
        return (
            checkForSponsoredFeedUnit(feedUnit) ||
            checkForSuggestedPost(feedUnit)
        );
    };

    const areNumbersClose = (n1, n2, threshold = 0.001) =>
        Math.abs(n1 - n2) <= threshold;

    const isPotentiallySponsoredLink = (feedUnitRect, link) => {
        if (!link) {
            return link;
        }
        const linkRect = link.getBoundingClientRect();
        const diffX = linkRect.x - feedUnitRect.x;
        const diffY = linkRect.y - feedUnitRect.y;
        if (diffX >= 62 && diffX <= 66 && diffY >= 31 && diffY <= 35) {
            return link;
        }
        return undefined;
    };

    const checkForSponsoredFeedUnit = (feedUnit) => {
        const links = Array.from(feedUnit.querySelectorAll("a"));
        if (links.length < 4) {
            return false;
        }
        const feedUnitRect = feedUnit.getBoundingClientRect();
        let link =
            isPotentiallySponsoredLink(feedUnitRect, links[2]) ||
            isPotentiallySponsoredLink(feedUnitRect, links[3]);
        if (!link) {
            return false;
        }
        const eles = link.querySelectorAll("*");
        if (eles.length == 0) {
            return false;
        }
        const y = link.getBoundingClientRect().y;
        let text = "";
        const letters3 = [];
        // @ts-ignore
        Array.from(eles).forEach((e: Element) => {
            const rect = e.getBoundingClientRect();
            if (
                e.children.length == 0 &&
                // @ts-ignore
                e.textContent.length >= 1 &&
                !e.hasAttribute("style") &&
                rect.y == y
            ) {
                text += e.textContent;
            }
            // @ts-ignore
            if (areNumbersClose(rect.y, y, 2) && e.textContent.length <= 2) {
                // @ts-ignore
                letters3.push({text: e.textContent, order: rect.x});
            }
        });
        const text3 = letters3 // @ts-ignore
            .sort((a, b) => a.order - b.order) 
            // @ts-ignore
            .map((x) => x.text) 
            .join("");
        return (
            adTexts[lang].isSponsored(text) || adTexts[lang].isSponsored(text3)
        );
    };

    const adTexts = {
        en: {
            isSponsored: (str) => str.endsWith("ponsored"), //sponsored
            isSuggested: (str) => str.endsWith("uggested for you"), //suggested for you
        },
        es: {
            isSponsored: (str) => str.endsWith("ublicidad"), //publicidad
            isSuggested: (str) => str.endsWith("ugerencia para ti"), //sugerencia para ti
        },
        pt: {
            isSponsored: (str) => str.endsWith("atrocinado"), //patrocinado
            isSuggested: (str) =>
                str.endsWith("ugestões para você") ||
                str.endsWith("ugestões para ti"), //sugestões para você, sugestões para ti
        },
        de: {
            isSponsored: (str) => str.endsWith("esponsert"), //gesponsert
            isSuggested: (str) => str.endsWith("orschläge für dich"), //vorschläge für dich
        },
        fr: {
            isSponsored: (str) =>
                str.endsWith("ponsorisé") || str.endsWith("ommandité"), //sponsorisé, commandité
            isSuggested: (str) => str.endsWith("uggestion pour vous"), //suggestion pour vous
        },
        it: {
            isSponsored: (str) => str.endsWith("ponsorizzato"), //sponsorizzato
            isSuggested: (str) => str.endsWith("ontenuto suggerito per te"), //contenuto suggerito per te
        },
        nl: {
            isSponsored: (str) => str.endsWith("esponsord"), //gesponsord
            isSuggested: (str) => str.endsWith("oorgesteld voor jou"), //voorgesteld voor jou
        },
        pl: {
            isSponsored: (str) => str.endsWith("ponsorowane"), //sponsorowane
            isSuggested: (str) => str.endsWith("roponowana dla ciebie"), //proponowana dla ciebie
        },
        ru: {
            isSponsored: (str) => str.endsWith("еклама"), //реклама
            isSuggested: (str) => str.endsWith("екомендация для вас"), //рекомендация для васs
        },
    };

    const checkForSuggestedPost = (feedUnit) => {
        const span = feedUnit.querySelector(
            "div.rq0escxv.l9j0dhe7 > span.d2edcug0.hpfvmrgz"
        );
        if (!span) {
            return false;
        }
        const str = span.innerText.trim().toLowerCase();
        return adTexts[lang].isSuggested(str);
    };

    const observeAndBlockSponsoredFeedItems = (tab) => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    // @ts-ignore
                    mutation.addedNodes.forEach((addedNode: Element) => {
                        if (addedNode.localName !== "div") {
                            return;
                        }
                        if (
                            addedNode.parentElement &&
                            addedNode.parentElement.getAttribute("role") ===
                                "feed"
                        ) {
                            if (
                                checkForPaidFeedUnit(addedNode) &&
                                !isHidden(addedNode)
                            ) {
                                (addedNode as HTMLElement).style.display =
                                    "none";
                                recordBlockedAd(tab);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    const blockSponsoredRightRail = (tab) => {
        // Removes the "Sponsored" section on the right side of the page
        const sponsoredSpan = document.querySelector(
            "div[role='complementary'] > div > div > div > div > div > span"
        );
        const title = sponsoredSpan && sponsoredSpan.querySelector("span");
        if (
            title &&
            adTexts[lang].isSponsored(title.textContent) &&
            !isHidden(sponsoredSpan)
        ) {
            (sponsoredSpan as HTMLElement).style.display = "none";
            recordBlockedAd(tab);
        }
    };

    const getLang = () => {
        const docLang = document.documentElement.lang;
        const supportedLangs = Object.keys(adTexts);
        if (docLang && supportedLangs.includes(docLang)) {
            return docLang;
        }
        //If we cannot get the language from documentElement, try reading the placeHolder in the search input
        const searchBox = document.querySelector("input[type='search']");
        const searchText =
            (searchBox && (searchBox as HTMLInputElement).placeholder) || "";
        switch (searchText) {
            case "Search Facebook":
                return "en";
            case "Buscar en Facebook":
                return "es";
            case "Busca en Facebook":
                return "es";
            case "Pesquisar no Facebook":
                return "pt";
            case "Pesquisa no Facebook":
                return "pt";
            case "Facebook durchsuchen":
                return "de";
            case "Rechercher sur Facebook":
                return "fr";
            case "Cerca su Facebook":
                return "it";
            case "Zoeken op Facebook":
                return "nl";
            case "Szukaj na Facebooku":
                return "pl";
            case "Поиск на Facebook":
                return "ru";
        }
        return "en";
    };

    try {
        const tabInfo = await getTabInfo();
        const shouldBlockAds = await isAdProtectionActive(
            tabInfo.tabId,
            pageUrl
        );
        if (shouldBlockAds === false) {
            return;
        }

        lang = getLang();
        malwarebytesClearFbAds(tabInfo);
        setInterval(() => malwarebytesClearFbAds(tabInfo), 2000);

        blockSponsoredRightRail(tabInfo);
        setInterval(() => blockSponsoredRightRail(tabInfo), 2000);
        // Clear sponsored post if it's the first item on the feed
        // by this time, the mutation observer may not have been started
        blockInitialSponsoredFeedItem(tabInfo);
    } catch (err) {
        console.error("FBA: Error occurred while hiding facebook ads. ", err);
    }

    // clear additional lazy-loaded sponsored posts without having to use a timer.
    // This approach is faster than calling the method every (n) seconds.
    const onDOMContentLoaded = async () => {
        const tab = await getTabInfo();
        const shouldBlockAds = await isAdProtectionActive(tab.tabId, pageUrl);
        if (shouldBlockAds === false) {
            return;
        }
        lang = getLang();
        blockInitialSponsoredFeedItem(tab);
        observeAndBlockSponsoredFeedItems(tab);
    };

    //https://developer.apple.com/forums/thread/651215
    if (document.readyState !== "loading") {
        onDOMContentLoaded();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            onDOMContentLoaded();
        });
    }
}
