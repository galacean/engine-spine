import { Disposable, Map } from "./Utils";
import { TextureAtlas } from "./TextureAtlas";
export declare class AssetManager implements Disposable {
    private pathPrefix;
    private textureLoader;
    private assets;
    private errors;
    private toLoad;
    private loaded;
    private rawDataUris;
    constructor(textureLoader: (image: HTMLImageElement) => any, pathPrefix?: string);
    private downloadText;
    private downloadBinary;
    setRawDataURI(path: string, data: string): void;
    loadBinary(path: string, success?: (path: string, binary: Uint8Array) => void, error?: (path: string, error: string) => void): void;
    loadText(path: string, success?: (path: string, text: string) => void, error?: (path: string, error: string) => void): void;
    loadTexture(path: string, success?: (path: string, image: HTMLImageElement) => void, error?: (path: string, error: string) => void): void;
    loadTextureAtlas(path: string, success?: (path: string, atlas: TextureAtlas) => void, error?: (path: string, error: string) => void): void;
    get(path: string): any;
    remove(path: string): void;
    removeAll(): void;
    isLoadingComplete(): boolean;
    getToLoad(): number;
    getLoaded(): number;
    dispose(): void;
    hasErrors(): boolean;
    getErrors(): Map<string>;
}
