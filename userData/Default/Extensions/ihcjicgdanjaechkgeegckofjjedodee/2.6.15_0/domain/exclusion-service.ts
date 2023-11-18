import { browserName } from "@/utils/utils.js";
import type {Exclusion, ExclusionType} from "./types/exclusion";
import { SafariExclusionService } from "@/safari/exclusion-service";

export interface ExclusionService {
    exclude(host: string, exclusions: ExclusionType[]): Promise<boolean>;
    getAllExclusions(): Promise<Exclusion[]>;
    getExclusions_getExclusionsByNames(
        hostnames: string[]
    ): Promise<Exclusion[]>;
    removeAllExclusions(): Promise<boolean>;
    removeExclude(
        host: string,
        exclusions: ExclusionType[],
        addOverride: boolean
    ): Promise<boolean>;
    removeExclusions(host: string): Promise<boolean>;
    getExclusionsForHost(host: string): Promise<Exclusion | undefined>;
    isDomainExcluded(host: string, exclusion: ExclusionType): Promise<boolean>;
    excludeTemporarily(host: string, tabId: number): Promise<void>;
    isTemporarilyExcluded(host: string, tabId: number): Promise<boolean>;
}

export function getExclusionService(): ExclusionService {
    const browser = browserName();
    if (browser === "Safari") {
        return SafariExclusionService.getInstane();
    }

    return SafariExclusionService.getInstane();
}