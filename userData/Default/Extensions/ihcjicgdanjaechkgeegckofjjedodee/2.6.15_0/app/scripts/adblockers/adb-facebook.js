import{chrome}from"../../../utils/polyfill";import{MSG_RECORD_CONTENT_AD}from"../app-consts";const adTexts={en:{isSponsored:e=>e.endsWith("ponsored"),isSuggested:e=>e.endsWith("uggested for you")},es:{isSponsored:e=>e.endsWith("ublicidad"),isSuggested:e=>e.endsWith("ugerencia para ti")},pt:{isSponsored:e=>e.endsWith("atrocinado"),isSuggested:e=>e.endsWith("ugestões para você")||e.endsWith("ugestões para ti")},de:{isSponsored:e=>e.endsWith("esponsert"),isSuggested:e=>e.endsWith("orschläge für dich")},fr:{isSponsored:e=>e.endsWith("ponsorisé")||e.endsWith("ommandité"),isSuggested:e=>e.endsWith("uggestion pour vous")},it:{isSponsored:e=>e.endsWith("ponsorizzato"),isSuggested:e=>e.endsWith("ontenuto suggerito per te")},nl:{isSponsored:e=>e.endsWith("esponsord"),isSuggested:e=>e.endsWith("oorgesteld voor jou")},pl:{isSponsored:e=>e.endsWith("ponsorowane"),isSuggested:e=>e.endsWith("roponowana dla ciebie")},ru:{isSponsored:e=>e.endsWith("еклама"),isSuggested:e=>e.endsWith("екомендация для вас")}},recordBlocked=e=>{try{chrome.runtime.sendMessage({type:MSG_RECORD_CONTENT_AD,tabId:e.id,tabUrl:e.url})}catch(e){console.error("RBAD: Error occurred while recording blocked ad. "+e)}};export const blockSponsoredAndSuggested=(e,o)=>{new MutationObserver((s=>{for(let t of s)0!==t.addedNodes.length&&t.addedNodes.forEach((s=>{"div"===s.localName&&(removeSideSponsorship(o,e),removeElements(s,e,o),removeVisualArtifacts())}))})).observe(document.body,{childList:!0,subtree:!0}),removeSideSponsorship(o,e),document.querySelectorAll("div[aria-labelledby").forEach((s=>{removeElements(s,e,o)}))};function removeVisualArtifacts(){document.querySelectorAll("div[class='__fb-light-mode'] > svg").forEach((e=>{e.style.width="1px !important",e.style.height="1px !important",e.style.display="none"})),document.querySelectorAll("div[class='__fb-dark-mode'] > svg").forEach((e=>{e.style.width="1px !important",e.style.height="1px !important",e.style.display="none"}))}function removeElements(e,o,s){let t=Array.from(e.querySelectorAll("div[aria-labelledby"));removeSponsored(t,o,s),removeSuggested(t,o,s)}function removeSponsored(e,o,s){e.forEach((e=>{let t=e.querySelector("div > span > span > span > span > a > span > span use");if(!t)return;let n=t.getAttribute("xlink:href");if(!n)return;const r=document.getElementById(n.slice(1)),d=r.parentElement;if(r&&adTexts[o]&&adTexts[o].isSponsored(r.textContent)){window.useLogging&&console.log("Found sponsored: "+r.textContent);try{e.style.display="none",d.parentNode.style.display="none",recordBlocked(s)}catch(e){window.useLogging&&console.error(e)}}}))}function removeSuggested(e,o,s){e.forEach((e=>{let t=e.querySelector("div > div > div > span");if(t&&t.innerText&&adTexts[o]&&adTexts[o].isSuggested(t.innerText)){window.useLogging&&console.log("Found suggested: "+t.innerText);try{e.style.display="none",recordBlocked(s)}catch(e){window.useLogging&&console.error(e)}}}))}function removeSideSponsorship(e,o){try{document.querySelectorAll("div[role='complementary'] * span > div > div > div").forEach((s=>{adTexts[o].isSponsored(s.innerText)&&"none"!==s.parentElement.style.display&&(s.parentElement.style.display="none",recordBlocked(e))}))}catch(e){window.useLogging&&console.error(e)}}