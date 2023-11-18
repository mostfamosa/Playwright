import {ExclusionType} from "@/domain/types/exclusion";
import { SettingKey } from "@/domain/types/settings";

export interface LoadAllowListResponse {
    domain: string;
    protections: string[];
}

export type GetTabIdResponse = {
    tabId: number;
};

export type GetTabInfoResponse = {
    tabId: number;
    url: string;
};

export type GetTabDataResponse = {
    host: string;
    blocked: any;
    excluded: any;
};

export type IsProtectionActiveRequest = {
    tabId: number;
    url: string;
};

export type IsProtectionActiveResponse = {
    active: boolean;
};

export type IsAdProtectionActiveRequest = {
    domain: string;
};

export type IsAdProtectionActiveResponse = {
    active: boolean;
};

export type AddAllowTemporaryRequest = {
    domain: string;
    tabId: number;
};

export type AddAllowTemporaryResponse = {
    success: boolean;
};

export type AddAllowRequest = {
    domain: string;
    exclusions: ExclusionType[];
};

export type AddAllowResponse = {
    success: boolean;
};

export type RemAllowSingleRequest = {
    domain: string;
    exclusions: ExclusionType[];
    override?: boolean;
};

export type RemAllowSingleResponse = {
    removed: boolean;
};

export type IsExcludedRequest = {
    type: ExclusionType;
    domain: string;
    tabId: number;
};

export type IsExcludedResponse = {
    excluded: boolean;
};

export type TelemetryPhishingTunnelRequest = {
    url: string;
}

export type DownloadLogsRequest = {
    fullLog?: boolean;
};

export type DownloadLogsResponse = {
    success: boolean;
    data: string;
};

export type DetectionRequest = {
    type: ExclusionType;
};

export type DetectionResponse = {
    detect: boolean;
};

export type GetSettingRequest = {
    key: SettingKey;
};

export type GetSettingResponse = {
    value: unknown;
};

export type LoadInlineScriptRequest = {
    tabId: number;
    source: string;
};