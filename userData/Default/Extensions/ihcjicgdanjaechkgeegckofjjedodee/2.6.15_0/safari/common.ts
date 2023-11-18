import {
    EXCLUSION_ADS,
    EXCLUSION_MALWARE,
    EXCLUSION_SCAMS,
    ExclusionType,
} from "@/domain/types/exclusion";

export const contentBlockerAds = "mbgc.db.ads";
export const contentBlockerMalware = "mbgc.db.malware";
export const contentBlockerScams = "mbgc.db.scams";
export const contentBlockerExclusionMap: Record<string, ExclusionType> = {
    "mbgc.db.ads": EXCLUSION_ADS,
    "mbgc.db.malware": EXCLUSION_MALWARE,
    "mbgc.db.scams": EXCLUSION_SCAMS,
};
// reverse contentBlockerExclusionMap
export const exclusionContentBlockerMap: Record<ExclusionType, string> = Object.fromEntries(
    Object.entries(contentBlockerExclusionMap).map((entry) => entry.reverse())
);
