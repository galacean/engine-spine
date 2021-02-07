import { ResourceManager } from "@oasis-engine/core";
import { AssetConfig } from "../types";
import { SchemaResource } from "./SchemaResource";
export declare class BlinnPhongMaterialResource extends SchemaResource {
    load(resourceManager: ResourceManager, assetConfig: AssetConfig): Promise<BlinnPhongMaterialResource>;
    setMeta(): void;
}
