import {
  AssetPromise,
  Loader,
  resourceLoader,
  ResourceManager,
  Texture2D,
  Engine,
} from "@galacean/engine";
import { SpineLoadItem, SpineResource } from "./types";
import { AssetUtility, getUrlSuffix } from './AssetUtility';
import { SkeletonData } from '../spine-core/SkeletonData';

@resourceLoader("spine", ["json", "bin", "skel"])
class SpineLoader extends Loader<SkeletonData> {
  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<SkeletonData> {
    return new AssetPromise((resolve, reject) => {
      let resource: SpineResource = {
        skeletonPath: '',
        skeletonSuffix: '',
        atlasPath: '',
        imagePaths: [],
      };
      let { fileSuffix, imageLoaderType } = item.params || {};
      if (item.urls) {
        fileSuffix = this._normalizeFileSuffix(fileSuffix, true);
        for (let i = 0; i < item.urls.length; i += 1) {
          const url = item.urls[i];
          const suffix = fileSuffix && fileSuffix[i] || null;
          this._parseAndAssignFileResources(url, suffix, resource);
        }
      } else {
        fileSuffix = this._normalizeFileSuffix(fileSuffix, false);
        this._deriveAndAssignFileResources(item.url, fileSuffix as string, resource);
      }
      this._loadAndCreateSpineDataAsset(resource, resourceManager.engine, imageLoaderType)
      .then((skeletonData) => {
        resolve(skeletonData);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }

  private _parseAndAssignFileResources(url: string, fileSuffix: string | null, resource: SpineResource) {
    const imageFormats = ["png", "jpg", "webp", "jpeg", "ktx", "ktx2"];
    const skeletonFormats = ["skel", "json", "bin"];
    const ext = getUrlSuffix(url, fileSuffix);
    if (!ext) return;

    if (skeletonFormats.includes(ext)) {
      resource.skeletonPath = url;
      resource.skeletonSuffix = ext;
    }

    if (ext === 'atlas') {
      resource.atlasPath = url;
    }

    if (imageFormats.includes(ext)) {
      resource.imagePaths.push(url);
    }
  }

  private _deriveAndAssignFileResources(url: string, fileSuffix: string | null, resource: SpineResource) {
    const ext = getUrlSuffix(url, fileSuffix);
    if (!ext) return;
    resource.skeletonPath = url;
    resource.skeletonSuffix = ext;
    const baseUrl = new URL(url);
    let baseUrlString = baseUrl.origin + baseUrl.pathname;
    if (baseUrlString.endsWith('.json')) {
      baseUrlString = baseUrlString.substring(0, baseUrlString.length - 5);
    }
    const atlasUrl = baseUrlString + '.atlas';
    resource.atlasPath = atlasUrl;
  }

  private _loadAndCreateSpineDataAsset(resource: SpineResource, engine: Engine, imageLoaderType: string) {
    const { skeletonPath, atlasPath, imagePaths } = resource;
    if (skeletonPath && atlasPath && imagePaths.length === 0) {
      return AssetUtility.handleSkeletonAndAtlasFiles(resource, engine, imageLoaderType);
    }
    if (skeletonPath && atlasPath && imagePaths.length > 0) {
      return AssetUtility.handleAllFiles(resource, engine, imageLoaderType);
    }
    throw new Error("Lack spine resource.");
  }

  private _normalizeFileSuffix(fileSuffix: string | string[], expectArray: boolean): string | string[] | null {
    if (!fileSuffix) return null;
    if (expectArray && !Array.isArray(fileSuffix)) {
      console.error('Expected fileSuffix to be an array.');
      return [];
    } else if (!expectArray && typeof fileSuffix !== 'string') {
      console.error('Expected fileSuffix to be a string.');
      return null;
    }
    return fileSuffix;
  }

  createAdaptiveTexture(texture: Texture2D) {
    return new AdaptiveTexture();
  }
  
}

export class AdaptiveTexture {
  // constructor(texture: Texture2D) {
  //   super(texture);
  //   this.texture.generateMipmaps();
  // }

  // setFilters(minFilter: any, magFilter: any) {
  //   if (minFilter === TextureFilter.Nearest) {
  //     this.texture.filterMode = TextureFilterMode.Point;
  //   } else if (magFilter === TextureFilter.MipMapLinearLinear) {
  //     this.texture.filterMode = TextureFilterMode.Trilinear;
  //   } else {
  //     this.texture.filterMode = TextureFilterMode.Bilinear;
  //   }
  // }

  // // @ts-ignore
  // setWraps(uWrap: TextureWrapMode, vWrap: TextureWrapMode) {
  //   this.texture.wrapModeU = uWrap;
  //   this.texture.wrapModeV = vWrap;
  // }

  // dispose() {}
}

export { SpineLoader };
