import {
  AssetPromise,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  Texture2D,
} from "@galacean/engine";
import { 
  createSpineResource, 
  createTextureAtlas, 
  loadTextureAtlas, 
  loadTexturesByPath, 
  getUrlExtension, 
  SkeletonRawData 
} from "./LoaderUtils";
import { SpineResource } from "./SpineResource";
import { BufferReader } from "../util/BufferReader";
import { TextureAtlas } from "@esotericsoftware/spine-core";

export type SpineAssetBundle = {
  skeletonPath: string;
  atlasPath: string;
  imagePaths: string[];
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
    const ext = getUrlExtension(url, fileExtension);
    if (!ext) return;
  
    if (skeletonExtensions.includes(ext)) {
      bundle.skeletonPath = url;
    }
    if (ext === 'atlas') {
      bundle.atlasPath = url;
    }
    if (imageExtensions.includes(ext)) {
      bundle.imagePaths.push(url);
    }
  }

  static deriveAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
    const ext = getUrlExtension(url, fileExtension);
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


  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<SpineResource> {
    return new AssetPromise(async (resolve) => {
      let resource: SpineResource;
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
  ): Promise<SpineResource> {
    let skeletonRawData: ArrayBuffer | string;
    let atlasRefId: string;
    const type = header.startsWith('spine:skel') ? 'skel' : 'json';
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
    return createSpineResource(engine, skeletonRawData, textureAtlas);
  }

  private async _handleOriginAsset(
    item: LoadItem, 
    resourceManager: ResourceManager, 
    buffer?: ArrayBuffer,
  ): Promise<SpineResource> {
    let { fileExtensions } = item.params || {};
    let spineAssetBundle: SpineAssetBundle = {
      skeletonPath: '',
      atlasPath: '',
      imagePaths: [],
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
      const { skeletonRawData } = this._determineSkeletonDataType(buffer);
      return createSpineResource(engine, skeletonRawData, textureAtlas);
    } else { // multi url
      fileExtensions = SpineLoader.verifyFileExtensions(fileExtensions, true);
      for (let i = 0; i < item.urls.length; i += 1) {
        const url = item.urls[i];
        const extension = fileExtensions && fileExtensions[i] || null;
        SpineLoader.parseAndAssignSpineAsset(url, extension, spineAssetBundle);
      }
      const { skeletonPath, atlasPath, imagePaths }  = spineAssetBundle;
      if (!skeletonPath || !atlasPath) {
        throw new Error('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
      }
      const skeletonExtension = getUrlExtension(skeletonPath, null);
      const skeletonPromise = skeletonExtension === 'json' ? this.request(skeletonPath, { type: 'text'}) : this.request(skeletonPath, { type: 'arraybuffer' });
      let loadQueue: Promise<any>[] = [ skeletonPromise ];
      let textureAtlas: TextureAtlas;
      let skeletonRawData: SkeletonRawData;
      if (imagePaths.length > 0) {
        loadQueue = loadQueue.concat([
          this.request(atlasPath, { type: 'text'}),
          loadTexturesByPath(imagePaths, engine),
        ]);
        let atlasText: string, textures: Texture2D[];
        [skeletonRawData, atlasText, textures] = await Promise.all(loadQueue);
        textureAtlas = createTextureAtlas(atlasText, textures);
      } else {
        loadQueue.push(loadTextureAtlas(atlasPath, engine));
        [skeletonRawData, textureAtlas] = await Promise.all(loadQueue);
      }
      return createSpineResource(engine, skeletonRawData, textureAtlas);
    }
  }

  private _determineSkeletonDataType(buffer: ArrayBuffer) {
    let skeletonRawData: SkeletonRawData;
    try {
      const decoder = new TextDecoder('utf-8');
      const jsonString = decoder.decode(buffer);
      JSON.parse(jsonString);
      skeletonRawData = jsonString;
    } catch (error) {
      skeletonRawData = buffer;
    }
    return { skeletonRawData };
  }
  

}
