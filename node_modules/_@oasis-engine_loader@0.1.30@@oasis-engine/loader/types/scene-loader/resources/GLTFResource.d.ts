import { ResourceManager } from "@oasis-engine/core";
import { Oasis } from "../Oasis";
import { AssetConfig, LoadAttachedResourceResult } from "../types";
import { SchemaResource } from "./SchemaResource";
export declare class GLTFResource extends SchemaResource {
    load(resourceManager: ResourceManager, assetConfig: AssetConfig, oasis: Oasis): Promise<any>;
    loadWithAttachedResources(resourceManager: ResourceManager, assetConfig: AssetConfig, oasis: Oasis): Promise<LoadAttachedResourceResult>;
    setMeta(assetConfig?: AssetConfig): void;
    bind(): void;
    update(key: string, value: any): void;
    private bindMaterials;
    private getNodeByMeshIndex;
}
