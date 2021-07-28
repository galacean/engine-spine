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
} from 'oasis-engine';
import { AssetManager } from './spine-core/AssetManager';
import { TextureAtlas } from './spine-core/TextureAtlas';
import { Texture } from './spine-core/Texture';
import { AtlasAttachmentLoader } from './spine-core/AtlasAttachmentLoader';
import { SkeletonJson } from './spine-core/SkeletonJson';
import { SkeletonBinary } from './spine-core/SkeletonBinary';
import { SpineAnimation } from './SpineAnimation';

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
    return new AssetPromise((resolve, reject) => {
      // @ts-ignore
      if (item.type !== 'spine') {
        reject('Asset type must be spine.');
      }

      let resource: SpineResouce;

      if (!item.urls && item.url && this.checkUrl(item.url)) {
        resource = this.getResouceFromUrl(item.url);
      }

      if (item.urls && this.checkUrls(item.urls)) {
        resource = this.getResouceFromUrls(item.urls);
      }
      
      let autoLoadTexture: boolean = false;
      let assetManager: AssetManager;
      let skeletonLoader: SkeletonJson | SkeletonBinary;
      assetManager = new AssetManager((data) => {
        return new AdaptiveTexture(data, resourceManager.engine);
      });
      const { skeletonFile, atlasFile, textureFile } = resource;
      if (skeletonFile && atlasFile && textureFile) {
        assetManager.loadText(skeletonFile);
        assetManager.loadText(atlasFile);
        assetManager.loadTexture(textureFile);
      } else if (skeletonFile && atlasFile && !textureFile) {
        autoLoadTexture = true;
        assetManager.loadText(skeletonFile);
        assetManager.loadTextureAtlas(atlasFile);
      } else {
        reject('Resouce param error');
      }

      this.onLoad(assetManager).then((loadRes) => {
        if (loadRes !== 'loaded') {
          reject(loadRes);
        }
        let atlas: TextureAtlas;
        if (autoLoadTexture) {
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
        const mtl = resourceManager.engine._spriteDefaultMaterial.clone();
        meshRenderer.setMaterial(mtl);
        const spineAnimation = entity.addComponent(SpineAnimation);
        spineAnimation.setSkeletonData(skeletonData);
        resolve(entity);
      })
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
      atlasFile = atlasFile.substr(0, queryStringPos);
    }
    atlasFile = atlasFile.substr(0, atlasFile.lastIndexOf('.')) + atlasSuffix;
    return { skeletonFile, atlasFile };
  }

  checkUrls(urls: string[]): boolean {
    if (urls.length < 2) {
      console.error('When use urls as params, urls should at least contain: json/bin and atlas');
      return false;
    }
    if (urls.length > 3) {
      console.error('Spine runtime dont support multiple texture now');
      return false;
    }
    
    const { skeletonFile, atlasFile, textureFile } = this.getResouceFromUrls(urls);
    if (skeletonFile &&  atlasFile) {
      return true;
    }
    console.error(`Lack ${skeletonFile ? '' : 'skeletonFile'}${!atlasFile ? '' : ' atlasFile'}`);
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
    this.texture.generateMipmaps();
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
