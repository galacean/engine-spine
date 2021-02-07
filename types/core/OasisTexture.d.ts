import { Texture as ITexture } from '../spine-core/Texture';
import * as o3 from 'oasis-engine';
export declare class OasisTextrure extends ITexture {
    texture: o3.Texture2D;
    constructor(engine: any, data: HTMLImageElement | ArrayBuffer, atlasWidth?: number, atlasHeight?: number);
    setFilters(minFilter: o3.TextureFilter, magFilter: o3.TextureFilter): void;
    setWraps(uWrap: o3.TextureWrapMode, vWrap: o3.TextureWrapMode): void;
    dispose(): void;
}
