import { ResourceManager } from "@oasis-engine/core";
import { Oasis } from "../Oasis";
import { AssetConfig } from "../types";
import { SchemaResource } from "./SchemaResource";
export declare class TextureResource extends SchemaResource {
    load(resourceManager: ResourceManager, assetConfig: AssetConfig, oasis: Oasis): Promise<TextureResource>;
    setMeta(): void;
}
