import { SchemaResource } from "./SchemaResource";
import { AssetConfig } from "../types";
import { Oasis } from "../Oasis";
export declare const scriptAbility: {};
export declare function script(name: string): (target: any) => void;
export declare class ScriptResource extends SchemaResource {
    private isInit;
    private initScriptContext;
    load(resourceLoader: any, assetConfig: AssetConfig, oasis: Oasis): Promise<ScriptResource>;
    setMeta(assetConfig?: AssetConfig): void;
}
