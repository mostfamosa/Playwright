import {
    EXCLUSION_ADS,
    EXCLUSION_MALWARE,
    EXCLUSION_SCAMS,
    ExclusionType,
} from "./exclusion";
import {
    SETTING_ADS,
    SETTING_MALWARE,
    SETTING_SCAMS,
    SettingKey,
} from "./settings";

export function exclusionTypeToSettingKey(
    exclusionType: ExclusionType
): SettingKey {
    switch (exclusionType) {
        case EXCLUSION_ADS:
            return SETTING_ADS;
        case EXCLUSION_MALWARE:
            return SETTING_MALWARE;
        case EXCLUSION_SCAMS:
            return SETTING_SCAMS;
        default:
            throw new Error(`Unknown exclusion type: ${exclusionType}`);
    }
}

export function settingKeyToExclusionType(
    settingKey: SettingKey
): ExclusionType {
    switch (settingKey) {
        case SETTING_ADS:
            return EXCLUSION_ADS;
        case SETTING_MALWARE:
            return EXCLUSION_MALWARE;
        case SETTING_SCAMS:
            return EXCLUSION_SCAMS;
        default:
            throw new Error(`Unknown setting key: ${settingKey}`);
    }
}
