import { AssetManager as IAssetManager } from "../spine-core/AssetManager";
export declare class AssetManager extends IAssetManager {
    private _checkRaf;
    constructor(engine: any, pathPrefix?: string);
    onLoad(): Promise<unknown>;
    checkLoaded(resolve: any): void;
}
