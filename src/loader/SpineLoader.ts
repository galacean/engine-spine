import { SkeletonData, TextureAtlas } from "@esotericsoftware/spine-core";
import {
  AssetPromise,
  BufferReader,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  Texture2D,
} from "@galacean/engine";
import { createSkeletonData, createTextureAtlas, loadTextureAtlas, loadTexturesByPaths } from "./LoaderUtils";
import { SpineResource } from "./SpineResource";

export type SpineAssetPath = {
  skeletonPath: string;
  atlasPath: string;
  imagePaths: string[];
  imageExtensions: string[];
}

type SpineLoaderParams = {
  fileExtensions?: string | string[];
}

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
export class SpineLoader extends Loader<SpineResource> {
  static imageExtensions = ["png", "jpg", "webp", "jpeg", "ktx", "ktx2"];
  static skeletonExtensions = ["skel", "json", "bin"];

  static parseAndAssignSpineAsset(url: string, fileExtension: string | null, assetPath: SpineAssetPath) {
    const { imageExtensions, skeletonExtensions } = SpineLoader;
    const ext = SpineLoader.getUrlExtension(url, fileExtension);
    if (!ext) return;

    if (skeletonExtensions.includes(ext)) {
      assetPath.skeletonPath = url;
    }
    if (ext === 'atlas') {
      assetPath.atlasPath = url;
    }
    if (imageExtensions.includes(ext)) {
      assetPath.imagePaths.push(url);
      assetPath.imageExtensions.push(ext);
    }
  }

  static deriveAndAssignSpineAsset(url: string, fileExtension: string | null, assetPath: SpineAssetPath) {
    const ext = SpineLoader.getUrlExtension(url, fileExtension);
    if (!ext) return;
    assetPath.skeletonPath = url;
    const extensionPattern: RegExp = /(\.(json|bin|skel))$/;
    let baseUrl;
    if (extensionPattern.test(url)) {
      baseUrl = url.replace(extensionPattern, '');
    }
    if (baseUrl) {
      const atlasUrl = baseUrl + '.atlas';
      assetPath.atlasPath = atlasUrl;
    }
  }

  static verifyFileExtensions(fileExtensions: string | string[], expectArray: boolean): string | string[] | null {
    if (!fileExtensions) return null;
    if (expectArray && !Array.isArray(fileExtensions)) {
      console.error('Expect fileExtensions to be an array.');
      return [];
    } else if (!expectArray && typeof fileExtensions !== 'string') {
      console.error('Expect fileExtensions to be a string.');
      return null;
    }
    return fileExtensions;
  }

  static getUrlExtension(url: string, fileExtension: string): string | null {
    if (fileExtension) {
      return fileExtension;
    }
    const regex = /\/([^\/?#]+)\.([a-zA-Z0-9]+)(\?|#|$)|\?[^#]*\.([a-zA-Z0-9]+)(\?|#|$)/;
    const match = url.match(regex);
    if (match) {
      return match[2] || match[4];
    }
    return null;
  }

  static canReadString(bufferReader: BufferReader): boolean {
    const currentPosition = bufferReader.position;
    if (currentPosition + 2 > bufferReader.data.byteLength) {
      return false;
    }
    const strByteLength = bufferReader["_dataView"].getUint16(currentPosition, true);
    return currentPosition + 2 + strByteLength <= bufferReader.data.byteLength;
  }

  private _bufferReader: BufferReader;
  private _fileName = 'Spine Entity';
  private _decoder = new TextDecoder('utf-8');
  private _resourceManager: ResourceManager;
  private _isSingleUrl = false;

  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager,
  ): AssetPromise<SpineResource> {
    return new AssetPromise(async (resolve) => {
      this._resourceManager = resourceManager;
      let resource: SpineResource;
      let { fileExtensions } = item.params || {};
      const spineAssetPath: SpineAssetPath = {
        skeletonPath: '',
        atlasPath: '',
        imagePaths: [],
        imageExtensions: [],
      };
      this._isSingleUrl = !item.urls;
      if (this._isSingleUrl) {
        const fileExtension = SpineLoader.verifyFileExtensions(fileExtensions, false);
        SpineLoader.deriveAndAssignSpineAsset(item.url, fileExtension as string, spineAssetPath);
      } else {
        fileExtensions = SpineLoader.verifyFileExtensions(fileExtensions, true);
        const urls = item.urls;
        const urlsLen = urls.length;
        for (let i = 0; i < urlsLen; i += 1) {
          const url = urls[i];
          const extension = fileExtensions && fileExtensions[i] || null;
          SpineLoader.parseAndAssignSpineAsset(url, extension, spineAssetPath);
        }
      }

      const { skeletonPath, atlasPath } = spineAssetPath;
      if (!skeletonPath || !atlasPath) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }

      this._fileName = this._extractFileName(skeletonPath);

      // @ts-ignore
      let skeletonRawData: ArrayBuffer | string = await resourceManager._request(skeletonPath, { type: 'arraybuffer' }) as ArrayBuffer;

      let isEditorAsset = false;

      try {
        const decoder = this._decoder;
        const jsonString = decoder.decode(skeletonRawData);
        const parsedJson = JSON.parse(jsonString);
        skeletonRawData = jsonString;
        if (parsedJson.spine) {
          isEditorAsset = true;
          skeletonRawData = parsedJson.data;
        }
      } catch {
        this._bufferReader = new BufferReader(new Uint8Array(skeletonRawData as ArrayBuffer));
        if (SpineLoader.canReadString(this._bufferReader) && this._bufferReader.nextStr().startsWith('spine')) {
          isEditorAsset = true;
        }
      }

      if (isEditorAsset) {
        resource = await this._handleEditorAsset(skeletonRawData);
      } else {
        resource = await this._handleOriginAsset(skeletonRawData, spineAssetPath);
      }
      resolve(resource);
    });
  }

  private async _handleEditorAsset(skeletonRawData: ArrayBuffer | string): Promise<SpineResource> {
    const resourceManager = this._resourceManager;
    let atlasRefId: string;
    if (typeof skeletonRawData === 'string') {
      const { atlas } = JSON.parse(skeletonRawData);
      atlasRefId = atlas.refId;
    } else {
      const reader = this._bufferReader;
      atlasRefId = reader.nextStr();
      skeletonRawData = reader.nextImageData();
    }
    // @ts-ignore
    const textureAtlas = await resourceManager.getResourceByRef({ refId: atlasRefId });
    const skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    return new SpineResource(resourceManager.engine, skeletonData, this._fileName);
  }

  private async _handleOriginAsset(
    skeletonRawData: ArrayBuffer | string,
    spineAssetPath: SpineAssetPath
  ): Promise<SpineResource> {
    const resourceManager = this._resourceManager;
    const { engine } = resourceManager;
    let skeletonData: SkeletonData;
    let textureAtlas: TextureAtlas;
    if (this._isSingleUrl) {
      const { atlasPath } = spineAssetPath;
      textureAtlas = await loadTextureAtlas(atlasPath, engine);
      skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    } else {
      const { atlasPath, imagePaths, imageExtensions } = spineAssetPath;
      let textureAtlas: TextureAtlas;
      if (imagePaths.length > 0) {
        let atlasText: string, textures: Texture2D[];
        [atlasText, textures] = await Promise.all([
          // @ts-ignore
          resourceManager._request(atlasPath, { type: 'text' }) as Promise<string>,
          loadTexturesByPaths(imagePaths, imageExtensions, engine),
        ]);
        textureAtlas = createTextureAtlas(atlasText, textures);
      } else {
        textureAtlas = await loadTextureAtlas(atlasPath, engine);
      }
      skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    }
    return new SpineResource(engine, skeletonData, this._fileName);
  }

  private _extractFileName(url: string): string {
    const match = url.match(/\/([^\/]+?)(\.[^\/]*)?$/);
    return match ? match[1] : "Spine Entity";
  }
}