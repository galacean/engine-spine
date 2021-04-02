export declare abstract class Texture {
    protected _image: HTMLImageElement | ImageBitmap;
    constructor(image: HTMLImageElement | ImageBitmap);
    getImage(): HTMLImageElement | ImageBitmap;
    abstract setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
    abstract setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
    abstract dispose(): void;
    static filterFromString(text: string): TextureFilter;
    static wrapFromString(text: string): TextureWrap;
}
export declare enum TextureFilter {
    Nearest = 9728,
    Linear = 9729,
    MipMap = 9987,
    MipMapNearestNearest = 9984,
    MipMapLinearNearest = 9985,
    MipMapNearestLinear = 9986,
    MipMapLinearLinear = 9987
}
export declare enum TextureWrap {
    MirroredRepeat = 33648,
    ClampToEdge = 33071,
    Repeat = 10497
}
export declare class TextureRegion {
    renderObject: any;
    u: number;
    v: number;
    u2: number;
    v2: number;
    width: number;
    height: number;
    rotate: boolean;
    offsetX: number;
    offsetY: number;
    originalWidth: number;
    originalHeight: number;
}
export declare class FakeTexture extends Texture {
    setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
    setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
    dispose(): void;
}
