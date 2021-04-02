import { AssetPromise, Loader, LoadItem, ResourceManager, TextureWrapMode, Texture2D, Engine, Entity } from '@oasis-engine/core';
import { AssetManager } from './spine-core/AssetManager';
import { Texture } from './spine-core/Texture';
declare type SpineResouce = {
    skeletonFile: string;
    atlasFile: string;
    textureFile?: string;
};
declare type SpineOpt = {
    scale: number;
};
declare type SpineLoadItem = LoadItem & SpineOpt;
declare class SpineLoader extends Loader<Entity> {
    load(item: SpineLoadItem, resourceManager: ResourceManager): AssetPromise<Entity>;
    isBinFile(url: string): boolean;
    checkUrl(url: string): boolean;
    getResouceFromUrl(url: any): SpineResouce;
    checkUrls(urls: string[]): boolean;
    getResouceFromUrls(urls: string[]): SpineResouce;
    getExtFromUrl(url: string): string;
    onLoad(loader: AssetManager): Promise<any>;
}
export declare class AdaptiveTexture extends Texture {
    texture: Texture2D;
    constructor(data: HTMLImageElement, engine: Engine);
    setFilters(minFilter: any, magFilter: any): void;
    setWraps(uWrap: TextureWrapMode, vWrap: TextureWrapMode): void;
    dispose(): void;
}
export { SpineLoader };
