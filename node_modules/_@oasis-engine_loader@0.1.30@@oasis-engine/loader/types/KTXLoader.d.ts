import { AssetPromise, Loader, LoadItem, ResourceManager, Texture2D } from "@oasis-engine/core";
export declare class KTXLoader extends Loader<Texture2D> {
    load(item: LoadItem, resourceManager: ResourceManager): AssetPromise<Texture2D>;
}
