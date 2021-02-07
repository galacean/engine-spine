import { Disposable, Map } from "./Utils";
export declare class SharedAssetManager implements Disposable {
    private pathPrefix;
    private clientAssets;
    private queuedAssets;
    private rawAssets;
    private errors;
    constructor(pathPrefix?: string);
    private queueAsset;
    loadText(clientId: string, path: string): void;
    loadJson(clientId: string, path: string): void;
    loadTexture(clientId: string, textureLoader: (image: HTMLImageElement | ImageBitmap) => any, path: string): void;
    get(clientId: string, path: string): any;
    private updateClientAssets;
    isLoadingComplete(clientId: string): boolean;
    dispose(): void;
    hasErrors(): boolean;
    getErrors(): Map<string>;
}
