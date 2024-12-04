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

  static deriveAndAssignSpineAtlas(url: string, fileExtension: string | null, assetPath: SpineAssetPath) {
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

  static normalizeFileExtensions(fileExtensions: string | string[], expectArray: boolean): string | string[] | null {
    if (expectArray) {
      return Array.isArray(fileExtensions) ? fileExtensions : [];
    } else {
      return typeof fileExtensions === 'string' ? fileExtensions : null; 
    }
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
    return new AssetPromise(async (resolve, reject) => {
      this._resourceManager = resourceManager;
      const spineAssetPath: SpineAssetPath = {
        skeletonPath: '',
        atlasPath: '',
        imagePaths: [],
        imageExtensions: [],
      };
      this._isSingleUrl = !item.urls;
      let { fileExtensions } = item.params || {};
      if (this._isSingleUrl) {
        const fileExtension = SpineLoader.normalizeFileExtensions(fileExtensions, false);
        SpineLoader.deriveAndAssignSpineAtlas(item.url, fileExtension as string, spineAssetPath);
      } else {
        fileExtensions = SpineLoader.normalizeFileExtensions(fileExtensions, true);
        const urls = item.urls;
        const urlsLen = urls.length;
        for (let i = 0; i < urlsLen; i += 1) {
          const url = urls[i];
          const extension = fileExtensions[i] || null;
          SpineLoader.parseAndAssignSpineAsset(url, extension, spineAssetPath);
        }
      }

      const { skeletonPath, atlasPath } = spineAssetPath;
      if (!skeletonPath || !atlasPath) {
        reject(new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.'));
        return;
      }

      this._fileName = this._extractFileName(skeletonPath);

      let skeletonRawData: ArrayBuffer | string
      try {
        // @ts-ignore
        skeletonRawData = await resourceManager._request(skeletonPath, { type: 'arraybuffer' }) as ArrayBuffer;
      } catch (err) {
        reject(err);
        return;
      }

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

      let resource: SpineResource;
      try {
        if (isEditorAsset) {
          resource = await this._handleEditorAsset(skeletonRawData);
        } else {
          resource = await this._handleOriginAsset(skeletonRawData, spineAssetPath);
        }
      } catch (err) {
        reject(err);
        return;
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
    let textureAtlas: TextureAtlas;
    try {
      // @ts-ignore
      textureAtlas = await resourceManager.getResourceByRef({ refId: atlasRefId });
    } catch (err) {
      throw err;
    }
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
      try {
        textureAtlas = await loadTextureAtlas(atlasPath, engine);
      } catch (err) {
        throw err;
      }
      skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    } else {
      const { atlasPath, imagePaths, imageExtensions } = spineAssetPath;
      let atlasText: string
      let textures: Texture2D[];
      let textureAtlas: TextureAtlas;
      try {
        if (imagePaths.length > 0) {
          [atlasText, textures] = await Promise.all([
            // @ts-ignore
            resourceManager._request(atlasPath, { type: 'text' }) as Promise<string>,
            loadTexturesByPaths(imagePaths, imageExtensions, engine),
          ]);
          textureAtlas = createTextureAtlas(atlasText, textures);
        } else {
          textureAtlas = await loadTextureAtlas(atlasPath, engine);
        }
      } catch (err) {
        throw err;
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