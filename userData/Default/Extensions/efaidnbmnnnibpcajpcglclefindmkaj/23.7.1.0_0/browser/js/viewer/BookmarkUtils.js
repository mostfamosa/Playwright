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
import{dcLocalStorage as o}from"../../../common/local-storage.js";function e(o,e,r){try{chrome.bookmarks.getTree((s=>{const t=s[0]?.children[0]?.id;t?chrome.bookmarks.create({parentId:t,title:"Adobe Acrobat Home",url:o},(()=>e({success:!0}))):chrome.bookmarks.create({title:"Adobe Acrobat Home",url:o},(()=>e({success:!0}))),r("DCBrowserExt:Viewer:BookmarkCreation:Successful")}))}catch(o){e({error:o})}}export default function r(r,s,t){if(o.getItem("bookmarkedWeb"))s({error:"bookmark already created"});else{o.setItem("bookmarkedWeb","true");try{chrome.permissions.contains({permissions:["bookmarks"],origins:["https://www.google.com/"]},(o=>{o?e(r,s,t):(t("DCBrowserExt:Viewer:Bookmark:PermissionDialog:Shown"),chrome.permissions.request({permissions:["bookmarks"],origins:["https://www.google.com/"]},(o=>{o?(t("DCBrowserExt:Viewer:Bookmark:PermissionDialog:Granted"),e(r,s,t)):(t("DCBrowserExt:Viewer:Bookmark:PermissionDialog:Denied"),s({denied:!0}))})))}))}catch(o){s({error:o})}}}