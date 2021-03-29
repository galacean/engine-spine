import {
  AssetPromise,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  TextureFilterMode,
  TextureWrapMode,
  Texture2D,
  Engine,
  Entity,
  MeshRenderer
} from '@oasis-engine/core';
import { AssetManager } from './spine-core/AssetManager';
import { TextureAtlas } from './spine-core/TextureAtlas';
import { Texture } from './spine-core/Texture';
import { AtlasAttachmentLoader } from './spine-core/AtlasAttachmentLoader';
import { SkeletonJson } from './spine-core/SkeletonJson';
import { SkeletonBinary } from './spine-core/SkeletonBinary';
import { SpineAnimation } from './SpineAnimation';
import { SpineMaterial } from './core/SpineMaterial';

type SpineResouce = {
  skeletonFile: string
  atlasFile: string
  textureFile?: string
}

type SpineOpt = {
  scale: number;
}

type SpineLoadItem = LoadItem & SpineOpt;

// @ts-ignore
@resourceLoader('spine', ['json', 'bin'])
class SpineLoader extends Loader<Entity> {
  load(item: SpineLoadItem, resourceManager: ResourceManager): AssetPromise<Entity> {
    return new AssetPromise(async (resolve, reject) => {
      // @ts-ignore
      if (item.type !== 'spine') {
        reject('Asset type must be spine.');
      }

      let resource: SpineResouce;
      let autoGenUrl = false;

      if (!item.urls && item.url && this.checkUrl(item.url)) {
        autoGenUrl = true;
        resource = this.getResouceFromUrl(item.url);
      }

      if (item.urls && this.checkUrls(item.urls)) {
        resource = this.getResouceFromUrls(item.urls);
      }
      
      let assetManager: AssetManager;
      let skeletonLoader: SkeletonJson | SkeletonBinary;
      assetManager = new AssetManager((data) => {
        return new AdaptiveTexture(data, resourceManager.engine);
      });
      const { skeletonFile, atlasFile, textureFile } = resource;
      if (resource && autoGenUrl) {
        assetManager.loadText(skeletonFile);
        assetManager.loadTextureAtlas(atlasFile);
      } else if (resource && !autoGenUrl) {
        assetManager.loadText(skeletonFile);
        assetManager.loadText(atlasFile);
        assetManager.loadTexture(textureFile);
      } else {
        reject('Resouce param error');
      }

      const loadRes = await this.onLoad(assetManager);
      if (loadRes !== 'loaded') {
        reject(loadRes);
      }

      let atlas: TextureAtlas;
      if (autoGenUrl) {
        atlas = assetManager.get(atlasFile);
      } else {
        atlas = new TextureAtlas(assetManager.get(atlasFile), function () {
          return assetManager.get(textureFile);
        });
      }

      const atlasLoader = new AtlasAttachmentLoader(atlas);
      if (this.isBinFile(skeletonFile)) {
        skeletonLoader = new SkeletonBinary(atlasLoader);
      } else {
        skeletonLoader = new SkeletonJson(atlasLoader);
      }
      const skeletonData = skeletonLoader.readSkeletonData(assetManager.get(skeletonFile));
      const entity = new Entity(resourceManager.engine);
      const meshRenderer = entity.addComponent(MeshRenderer);
      const mtl = new SpineMaterial(resourceManager.engine);
      meshRenderer.setMaterial(mtl);
      const spineAnimation = entity.addComponent(SpineAnimation);
      spineAnimation.setSkeletonData(skeletonData);
      resolve(entity);
    });
  }

  isBinFile(url: string): boolean {
    const ext = this.getExtFromUrl(url);
    return ext === 'bin';
  }

  checkUrl(url: string): boolean {
    const ext = this.getExtFromUrl(url);
    if (ext === 'json' || ext === 'bin') {
      return true
    }
    console.error('When use url as params, url must be json or bin file');
    return false;
  }

  getResouceFromUrl(url): SpineResouce {
    const skeletonFile = url;
    const atlasSuffix = '.atlas';
    let atlasFile = url;
    let queryStringPos = atlasFile.indexOf('?');
    if (queryStringPos > 0) {
      atlasFile = atlasFile.substr(0, queryStringPos)
    }
    atlasFile = atlasFile.substr(0, atlasFile.lastIndexOf('.')) + atlasSuffix;
    return { skeletonFile, atlasFile };
  }

  checkUrls(urls: string[]): boolean {
    if (urls.length < 3) {
      console.error('When use urls as params, urls must contain three url: json/bin, atlas and img');
      return false;
    }
    if (urls.length > 3) {
      console.error('Spine runtime dont support multiple texture now');
      return false;
    }
    
    const { skeletonFile, atlasFile, textureFile } = this.getResouceFromUrls(urls);
    if (skeletonFile &&  atlasFile && textureFile) {
      return true;
    }
    console.error(`Lack ${skeletonFile ? '' : 'skeletonFile'}${!atlasFile ? '' : ' atlasFile'}${!textureFile ? '' : ' textureFile'}`);
    return false;
  }

  getResouceFromUrls(urls: string[]): SpineResouce {
    let skeletonFile: string;
    let atlasFile: string;
    let textureFile: string;
    for (let i = 0; i < urls.length; i += 1) {
      const url = urls[i];
      const ext = this.getExtFromUrl(url);
      if (ext === 'json' || ext === 'bin') {
        skeletonFile = url;
      }
      if (ext === 'atlas') {
        atlasFile = url;
      }
      const imgMap = ['png', 'jpg', 'webp', 'jpeg'];
      if (imgMap.includes(ext)) {
        textureFile = url;
      }
    }
    return {
      skeletonFile,
      atlasFile,
      textureFile
    };
  }

  getExtFromUrl(url: string): string {
    return url.split(/[#?]/)[0].split('.').pop().trim();
  }

  onLoad(loader: AssetManager): Promise<any> {
    return new Promise((res, rej) => {
      setInterval(() => {
        if (loader.isLoadingComplete()) {
          if (loader.hasErrors()) {
            rej(loader.getErrors());
          } else {
            res('loaded');
          }
        }
      }, 100);
    })
  }
  

}

export class AdaptiveTexture extends Texture {
  texture: Texture2D;

  constructor(data: HTMLImageElement, engine: Engine) {
    super(data);
    this.texture = new Texture2D(engine, data.width, data.height);
    this.texture.setImageSource(data);
  }

  setFilters(minFilter: any, magFilter: any) {
    if (minFilter === WebGLRenderingContext.NEAREST) {
      this.texture.filterMode = TextureFilterMode.Point;
    } else if (magFilter === WebGLRenderingContext.LINEAR_MIPMAP_LINEAR) {
      this.texture.filterMode = TextureFilterMode.Trilinear;
    } else {
      this.texture.filterMode = TextureFilterMode.Bilinear;
    }
  }

  // @ts-ignore
  setWraps(uWrap: TextureWrapMode, vWrap: TextureWrapMode) {
    this.texture.wrapModeU = uWrap;
    this.texture.wrapModeV = vWrap;
  }

  dispose() {}
}



export { SpineLoader };
