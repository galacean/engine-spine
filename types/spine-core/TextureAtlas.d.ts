import { Disposable } from "./Utils";
import { Texture, TextureFilter } from "./Texture";
import { TextureWrap, TextureRegion } from "./Texture";
export declare class TextureAtlas implements Disposable {
    pages: TextureAtlasPage[];
    regions: TextureAtlasRegion[];
    constructor(atlasText: string, textureLoader: (path: string, width?: number, height?: number) => any);
    private load;
    findRegion(name: string): TextureAtlasRegion;
    dispose(): void;
}
export declare class TextureAtlasPage {
    name: string;
    minFilter: TextureFilter;
    magFilter: TextureFilter;
    uWrap: TextureWrap;
    vWrap: TextureWrap;
    texture: Texture;
    width: number;
    height: number;
}
export declare class TextureAtlasRegion extends TextureRegion {
    page: TextureAtlasPage;
    name: string;
    x: number;
    y: number;
    index: number;
    rotate: boolean;
    degrees: number;
    texture: Texture;
}
