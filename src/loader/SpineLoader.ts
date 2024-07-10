import {
  AssetPromise,
  Engine,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
} from "@galacean/engine";
import { createSkeletonData, createTextureAtlas, getUrlExtension, loadTextureAtlas, loadTexturesByPath } from "./LoaderUtils";
import { SkeletonDataResource } from "./SkeletonDataResource";
import { BufferReader } from "../util/BufferReader";

export type SpineAssetBundle = {
  skeletonPath: string;
  skeletonExtension: string;
  skeletonTextData?: string | ArrayBuffer;
  atlasPath: string;
  imagePaths: string[];
  imageExtensions: string[];
}

type SpineLoaderParams =  {
  fileExtensions?: string | string[];
}

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
export class SpineLoader extends Loader<SkeletonDataResource> {
  static imageExtensions = ["png", "jpg", "webp", "jpeg", "ktx", "ktx2"];
  static skeletonExtensions = ["skel", "json", "bin"];

  static parseAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
    const imageExtension = SpineLoader.imageExtensions;
    const skeletonExtension = SpineLoader.skeletonExtensions;
    const ext = getUrlExtension(url, fileExtension);
    if (!ext) return;
  
    if (skeletonExtension.includes(ext)) {
      bundle.skeletonPath = url;
      bundle.skeletonExtension = ext;
    }
    if (ext === 'atlas') {
      bundle.atlasPath = url;
    }
    if (imageExtension.includes(ext)) {
      bundle.imagePaths.push(url);
      bundle.imageExtensions.push(ext);
    }
  }

  static deriveAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
    const ext = getUrlExtension(url, fileExtension);
    if (!ext) return;
    bundle.skeletonPath = url;
    bundle.skeletonExtension = ext;
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

  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<SkeletonDataResource> {
    return new AssetPromise(async (resolve) => {
      let resource: SkeletonDataResource;
      if (item.urls) { // single url might be editor asset
        resource = await this._handleOriginAsset(item, resourceManager);
      } else {
        const buffer: ArrayBuffer = await this.request(item.url, { type: 'arraybuffer' });
        const reader = new BufferReader(new Uint8Array(buffer));
        const header = reader.nextStr();
        if (header.startsWith('spine')) {
          resource = await this._handleEditorAsset(buffer, reader, header, resourceManager);
        } else {
          resource = await this._handleOriginAsset(item, resourceManager, buffer);
        }
      }
      resolve(resource);
    });
  }

  private async _handleEditorAsset(
    buffer: ArrayBuffer, 
    reader: BufferReader, 
    header: string, 
    resourceManager: ResourceManager,
  ): Promise<SkeletonDataResource> {
    let skeletonRawData: ArrayBuffer | string;
    let atlasRefId: string;
    const type = header.startsWith('spine:skel') ? 'skel' : 'json';
    // @ts-ignore
    const { engine } = resourceManager;
    if (type === 'skel') {
      atlasRefId = reader.nextStr();
      skeletonRawData = reader.nextImageData();
    } else {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(new Uint8Array(buffer));
      const { data, atlas } = JSON.parse(text);
      atlasRefId = atlas.refId;
      skeletonRawData = data;
    }
    // @ts-ignore
    const textureAtlas = await resourceManager.getResourceByRef({ refId: atlasRefId });
    const skeletonData = createSkeletonData(textureAtlas, skeletonRawData, type);
    return new SkeletonDataResource(engine, skeletonData);
  }

  private async _handleOriginAsset(
    item: LoadItem, 
    resourceManager: ResourceManager, 
    buffer?: ArrayBuffer,
  ): Promise<SkeletonDataResource> {
    let { fileExtensions } = item.params || {};
    let spineAssetBundle: SpineAssetBundle = {
      skeletonPath: '',
      skeletonExtension: '',
      atlasPath: '',
      imagePaths: [],
      imageExtensions: [],
    };
    const { engine } = resourceManager;
    if (buffer) { // single url
      const fileExtension = SpineLoader.verifyFileExtensions(fileExtensions, false);
      SpineLoader.deriveAndAssignSpineAsset(item.url, fileExtension as string, spineAssetBundle);
      const { skeletonPath, atlasPath } = spineAssetBundle;
      if (!skeletonPath || !atlasPath) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }
      const textureAtlas = await loadTextureAtlas(atlasPath, engine);
      const { data, type } = this.determineSkeletonDataType(buffer);
      const skeletonData = createSkeletonData(textureAtlas, data, type);
      return new SkeletonDataResource(engine, skeletonData); 
    } else { // multi url
      fileExtensions = SpineLoader.verifyFileExtensions(fileExtensions, true);
      for (let i = 0; i < item.urls.length; i += 1) {
        const url = item.urls[i];
        const extension = fileExtensions && fileExtensions[i] || null;
        SpineLoader.parseAndAssignSpineAsset(url, extension, spineAssetBundle);
      }
      const { skeletonPath, atlasPath, imagePaths, skeletonExtension, imageExtensions }  = spineAssetBundle;
      if (!skeletonPath || !atlasPath || imagePaths.length === 0) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }
      const skeletonPromise = skeletonExtension === 'json' ? this.request(skeletonPath, { type: 'text'}) : this.request(skeletonPath, { type: 'arraybuffer' });
      const type = skeletonExtension === 'json' ? 'json' : 'skel';
      const loadQueue: Promise<any>[] = [
        skeletonPromise,
        this.request(atlasPath, { type: 'text'}),
        loadTexturesByPath(imagePaths, imageExtensions, engine),
      ];
      const [skeletonTextData, atlasText, textures] = await Promise.all(loadQueue);
      const textureAtlas = createTextureAtlas(atlasText, textures);
      const skeletonData = createSkeletonData(textureAtlas, skeletonTextData, type);
      return new SkeletonDataResource(engine, skeletonData); 
    }
  }

  private determineSkeletonDataType(buffer: ArrayBuffer) {
    let skeletonTextData: ArrayBuffer | string;
    let type: 'json' | 'skel';
    try {
      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder.decode(buffer);
      JSON.parse(jsonString);
      skeletonTextData = jsonString;
      type = 'json';
    } catch (error) {
      skeletonTextData = buffer;
      type = 'skel';
    }
    return { data: skeletonTextData, type };
  }
  

}
