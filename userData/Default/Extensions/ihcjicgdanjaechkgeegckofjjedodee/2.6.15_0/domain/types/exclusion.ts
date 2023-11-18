export type ExclusionType = 'EXCLUSION_ADS' | 'EXCLUSION_MALWARE' | 'EXCLUSION_SCAMS';
export const EXCLUSION_ADS: ExclusionType = 'EXCLUSION_ADS';
export const EXCLUSION_MALWARE: ExclusionType = 'EXCLUSION_MALWARE';
export const EXCLUSION_SCAMS: ExclusionType = 'EXCLUSION_SCAMS';

export interface Exclusion {
    website: string;
    exclusions: ExclusionType[];
}

export function exclusionToFriendlyName(exclusion: ExclusionType): string {
    switch (exclusion) {
        case EXCLUSION_ADS:
            return 'Ads/Trackers';
        case EXCLUSION_MALWARE:
            return 'Malware';
        case EXCLUSION_SCAMS:
            return 'Scams';
        default:
            return '';
    }
}