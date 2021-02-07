import { SchemaResource } from "./SchemaResource";
import { AssetConfig } from "../types";
export declare class BaseResource extends SchemaResource {
    load(resourceLoader: any, assetConfig: AssetConfig): Promise<BaseResource>;
    setMetaData(key: any, value: any): void;
}
