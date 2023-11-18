/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property laws,
* including trade secret and or copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
import{common as e}from"./common.js";import{util as t}from"./util.js";import{SETTINGS as a}from"./settings.js";import{dcLocalStorage as s}from"../common/local-storage.js";import{floodgate as o}from"./floodgate.js";import{loggingApi as n}from"../common/loggingApi.js";let l;l||(l=new function(){this.updateVariables=function(l){try{let i=0!=l&&1!=l&&-1!=l,c=!(!i||l===a.READER_VER||l===a.ERP_READER_VER);s.setItem("locale",t.getFrictionlessLocale(chrome.i18n.getMessage("@@ui_locale"))),s.setItem("cdnUrl",e.getAcrobatViewerUri()),s.setItem("isDeskTop",i),s.setItem("env",e.getEnv()),s.setItem("viewerImsClientId",e.getViewerIMSClientId()),s.setItem("imsContextId",e.getImsContextId()),s.setItem("viewerImsClientIdSocial",e.getViewerIMSClientIdSocial()),s.setItem("imsURL",e.getIMSurl()),s.setItem("imsLibUrl",e.getImsLibUrl()),s.setItem("dcApiUri",e.getDcApiUri()),s.setItem("isAcrobat",c),s.getItem("theme")||s.setItem("theme","auto");let r=[this.checkFeatureEnable({flagName:"dc-cv-read-aloud",storageKey:"isReadAloudEnable"}),this.checkFeatureEnable({flagName:"dc-cv-full-screen-mode",storageKey:"fsm"}),this.checkFeatureEnable({flagName:"dc-cv-show-get-desktop",storageKey:"sgd"}),this.checkFeatureEnable({flagName:"dc-cv-save-location-on-options",storageKey:"isSaveLocationPrefEnabled"}),this.checkFeatureEnable({flagName:"dc-cv-enable-splunk-logging",storageKey:"splunkLoggingEnable"}),this.checkFeatureEnable({flagName:"dc-cv-extension-menu",storageKey:"enableNewExtensionMenu"}),this.checkFeatureEnable({flagName:"dc-cv-enable-embed-viewer",storageKey:"ev"}),this.checkFeatureEnable({flagName:"dc-cv-ext-menu-dark-mode",storageKey:"enableExtMenuDarkMode"}),this.checkFeatureEnable({flagName:"dc-cv-share-link",storageKey:"sl"}),this.checkFeatureEnable({flagName:"dc-cv-alloy-on",storageKey:"ao"})];return navigator.onLine&&r.push(this.checkFeatureEnable({flagName:"dc-cv-offline-support-disable",storageKey:"offlineSupportDisable"})),Promise.all(r).then((([e,a,l,i,c,r,m,g,d,u])=>{if(!i&&s.getItem("saveLocation")?s.removeItem("saveLocation"):i&&!s.getItem("saveLocation")&&s.setItem("saveLocation","ask"),n.registerLogInterval(c),c){let e=o.getFeatureMeta("dc-cv-enable-splunk-logging")||{};e=JSON.parse(e),s.setItem("allowedLogIndex",e.index)}t.enableNewExtensionMenu(r)}))}catch(e){}},this.checkFeatureEnable=async function(e){const{flagName:t,storageKey:a}=e,n=await o.hasFlag(t);return a&&s.setItem(a,!!n),n}});export const viewerModuleUtils=l;