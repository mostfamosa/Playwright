export const SETTING_TELEMETRY_CONSENT = "sendTelemetry";
export const SETTING_ADS = "enableProtectionAds";
export const SETTING_GTLD = "enableProtectionGtld";
export const SETTING_NATIVE_MESSAGING = "enableNativeMessaging";
export const SETTING_MALWARE = "enableProtectionMalware";
export const SETTING_SCAMS = "enableProtectionScams";
export const SETTING_BLOCK_COUNT = "enableBlockCountDisplay";
export const SETTING_KILLSWITCH = "enableProtection";
export const SETTING_SKIMMER_PROTECTION = "enableSkimmerProtection";
export const SETTING_VERBOSE_LOGGING = "enableVerboseLogging";
export const SETTING_MONTHLY_NOTIFICATION = "enableMonthlyNotification";
export const SETTING_MALICIOUS_NOTIFICATION = "enableMaliciousNotification";
export const SETTING_MV3_ENABLED_FEATURES = "MV3_ENABLED_FEATURES";

export type SettingKey =
    | typeof SETTING_TELEMETRY_CONSENT
    | typeof SETTING_ADS
    | typeof SETTING_GTLD
    | typeof SETTING_NATIVE_MESSAGING
    | typeof SETTING_MALWARE
    | typeof SETTING_SCAMS
    | typeof SETTING_BLOCK_COUNT
    | typeof SETTING_KILLSWITCH
    | typeof SETTING_SKIMMER_PROTECTION
    | typeof SETTING_VERBOSE_LOGGING
    | typeof SETTING_MONTHLY_NOTIFICATION
    | typeof SETTING_MALICIOUS_NOTIFICATION
    | typeof SETTING_MV3_ENABLED_FEATURES;
