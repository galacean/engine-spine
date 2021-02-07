import { ResourceManager } from "@oasis-engine/core";
import { AssetConfig, LoadAttachedResourceResult } from "../types";
import { SchemaResource } from "./SchemaResource";
export declare class PBRMaterialResource extends SchemaResource {
    private configProps;
    load(resourceManager: ResourceManager, assetConfig: AssetConfig): Promise<PBRMaterialResource>;
    loadWithAttachedResources(resourceManager: ResourceManager, assetConfig: AssetConfig): Promise<LoadAttachedResourceResult>;
    setMeta(): void;
    getProps(): {};
    bind(): void;
}
