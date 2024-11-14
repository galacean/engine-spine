import {
  AssetPromise,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  Texture2D,
} from "@galacean/engine";
import { TextureAtlas } from "@esotericsoftware/spine-core";
import { createSpineResource, createTextureAtlas, loadTextureAtlas, loadTexturesByPaths } from "./LoaderUtils";
import { SpineResource } from "./SpineResource";
import { BufferReader } from "../util/BufferReader";

export type SpineAssetBundle = {
  skeletonPath: string;
  atlasPath: string;
  imagePaths: string[];
  imageExtensions: string[];
}

type SpineLoaderParams =  {
  fileExtensions?: string | string[];
}

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
export class SpineLoader extends Loader<SpineResource> {
  static imageExtensions = ["png", "jpg", "webp", "jpeg", "ktx", "ktx2"];
  static skeletonExtensions = ["skel", "json", "bin"];

  static parseAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
    const { imageExtensions, skeletonExtensions } = SpineLoader;
    const ext = SpineLoader.getUrlExtension(url, fileExtension);
    if (!ext) return;
  
    if (skeletonExtensions.includes(ext)) {
      bundle.skeletonPath = url;
    }
    if (ext === 'atlas') {
      bundle.atlasPath = url;
    }
    if (imageExtensions.includes(ext)) {
      bundle.imagePaths.push(url);
      bundle.imageExtensions.push(ext);
    }
  }

  static deriveAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
    const ext = SpineLoader.getUrlExtension(url, fileExtension);
    if (!ext) return;
    bundle.skeletonPath = url;
    const extensionPattern: RegExp = /(\.(json|bin|skel))$/;
    let baseUrl;
    if (extensionPattern.test(url)) {
      baseUrl = url.replace(extensionPattern, '');
    }
    if (baseUrl) {
      const atlasUrl = baseUrl + '.atlas';
      bundle.atlasPath = atlasUrl;
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

  private _bufferReader: BufferReader = new BufferReader();
  private _fileName = 'Spine Entity';

  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager,
  ): AssetPromise<SpineResource> {
    return new AssetPromise(async (resolve) => {
      let resource: SpineResource;
      if (item.urls) {  // origin asset
        resource = await this._handleOriginAsset(item, resourceManager);
      } else { 
        this._fileName = this._extractFileName(item.url);
        let skeletonRawData: ArrayBuffer | string;
        // @ts-ignore
        skeletonRawData = await resourceManager._request(item.url, { type: 'arraybuffer' }) as ArrayBuffer;
        this._bufferReader.init(new Uint8Array(skeletonRawData));
        const header = this._bufferReader.nextStr();
        const isEditorAsset = header.startsWith('spine');
        const isBin = header.startsWith('spine:skel');
        if (!isBin) {
          const decoder = new TextDecoder('utf-8');
          const jsonString = decoder.decode(skeletonRawData);
          skeletonRawData = jsonString;
        }
        if (isEditorAsset) {
          // editor asset
          resource = await this._handleEditorAsset(item, resourceManager, skeletonRawData);
        } else {
          // origin asset
          resource = await this._handleOriginAsset(item, resourceManager, skeletonRawData);
        }
      }
      resolve(resource);
    });
  }

  private async _handleEditorAsset(
    item: LoadItem,
    resourceManager: ResourceManager,
    skeletonRawData: ArrayBuffer | string, 
  ): Promise<SpineResource> {
    let atlasRefId: string;
    if (typeof skeletonRawData === 'string') {
      const { atlas } = JSON.parse(skeletonRawData);
      atlasRefId = atlas.refId;
    } else {
      const reader = this._bufferReader;
      atlasRefId = reader.nextStr();
    }
    // @ts-ignore
    const textureAtlas = await resourceManager.getResourceByRef({ refId: atlasRefId });
    return  createSpineResource(resourceManager.engine, skeletonRawData, textureAtlas, this._fileName);
  }

  private async _handleOriginAsset(
    item: LoadItem, 
    resourceManager: ResourceManager, 
    skeletonRawData?: ArrayBuffer | string,
  ): Promise<SpineResource> {
    let { fileExtensions } = item.params || {};
    let spineAssetBundle: SpineAssetBundle = {
      skeletonPath: '',
      atlasPath: '',
      imagePaths: [],
      imageExtensions: [],
    };
    const { engine } = resourceManager;
    if (skeletonRawData) { // single url
      this._fileName = this._extractFileName(item.url);
      const fileExtension = SpineLoader.verifyFileExtensions(fileExtensions, false);
      SpineLoader.deriveAndAssignSpineAsset(item.url, fileExtension as string, spineAssetBundle);
      const { skeletonPath, atlasPath } = spineAssetBundle;
      if (!skeletonPath || !atlasPath) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }
      const textureAtlas = await loadTextureAtlas(atlasPath, engine);
      return createSpineResource(engine, skeletonRawData, textureAtlas, this._fileName);
    } else { // multi url
      fileExtensions = SpineLoader.verifyFileExtensions(fileExtensions, true);
      for (let i = 0; i < item.urls.length; i += 1) {
        const url = item.urls[i];
        const extension = fileExtensions && fileExtensions[i] || null;
        SpineLoader.parseAndAssignSpineAsset(url, extension, spineAssetBundle);
      }
      const { skeletonPath, atlasPath, imagePaths, imageExtensions }  = spineAssetBundle;
      if (!skeletonPath || !atlasPath) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }
      this._fileName = this._extractFileName(skeletonPath);
      let textureAtlas: TextureAtlas;
      if (imagePaths.length > 0) {
        let atlasText: string, textures: Texture2D[];
        [atlasText, textures] = await Promise.all([
          // @ts-ignore
          resourceManager._request(atlasPath, { type: 'text'}) as Promise<string>,
          loadTexturesByPaths(imagePaths, imageExtensions, engine),
        ]);
        textureAtlas = createTextureAtlas(atlasText, textures);
      } else {
        textureAtlas = await loadTextureAtlas(atlasPath, engine);
      }
      return createSpineResource(engine, skeletonRawData, textureAtlas, this._fileName);
    }
  }

  private _extractFileName(url: string): string {
    const match = url.match(/\/([^\/]+?)(\.[^\/]*)?$/);
    return match ? match[1] : "Spine Entity";
  }
}