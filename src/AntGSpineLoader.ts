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
} from '@galacean/engine';
import { AssetManager } from './spine-core/AssetManager';
import { TextureAtlas } from './spine-core/TextureAtlas';
import { Texture, TextureFilter } from './spine-core/Texture';
import { AtlasAttachmentLoader } from './spine-core/AtlasAttachmentLoader';
import { SkeletonJson } from './spine-core/SkeletonJson';
import { SpineAnimation } from './SpineAnimation';

type SpineOpt = {
  scale: number;
}

type SpineLoadItem = LoadItem & SpineOpt;

@resourceLoader('antg_spine', ['json', 'bin'])
class SpineLoader extends Loader<Entity> {
  load(item: SpineLoadItem, resourceManager: ResourceManager): AssetPromise<Entity> {
    return new AssetPromise((resolve, reject) => {
      const { engine } = resourceManager;

      if (!item.url) {
        reject('AntG asset must be a json url.');
        return;
      }

      if (!this.checkUrl(item.url)) {
        reject('AntG asset must be a json url.');
        return;
      }

      const skeletonFile = item.url;
      let atlasFile: string;
      let textureFile: string;
      let jsonData: string;

      let assetManager: AssetManager;
      assetManager = new AssetManager(null, (img) => {
        return this.createAdaptiveTexture(img, engine);
      });

      loadText(skeletonFile).then((json: any) => {
        jsonData = json;
        if (!json._ext) {
          reject('AntG spine json must have ext data');
        } else {
          const { atlas, images } = json._ext;
          const imageKey = Object.keys(images)[0];
          const image = images[imageKey];
          atlasFile = atlas;
          textureFile = image;
          assetManager.loadText(atlas);
          assetManager.loadTexture(image);
        }
      }).catch(() => {
        reject('Resouce json load fail');
      });

      assetManager.onLoadComplete = () => {
        let atlas: TextureAtlas;
        const atlasText = assetManager.get(atlasFile);
        atlas = new TextureAtlas(atlasText, this.textureAssetPicker.bind(this, assetManager, textureFile));
        const atlasLoader = new AtlasAttachmentLoader(atlas);
        const skeletonLoader = new SkeletonJson(atlasLoader);
        const skeletonData = skeletonLoader.readSkeletonData(jsonData);
        const entity = new Entity(engine);
        const meshRenderer = entity.addComponent(MeshRenderer);
        meshRenderer.shaderData.enableMacro('USE_MODEL_MATRIX');
        meshRenderer.shaderData.enableMacro('USE_CUSTOM_TEXTURE');
        // @ts-ignore
        const mtl = engine._spriteDefaultMaterial.clone();
        meshRenderer.setMaterial(mtl);
        const spineAnimation = entity.addComponent(SpineAnimation);
        spineAnimation.setSkeletonData(skeletonData);
        resolve(entity);
      }
    });
  }

  textureAssetPicker(assetManager: AssetManager, textureFile: string) {
    return assetManager.get(textureFile);
  }

  createAdaptiveTexture(img, engine) {
    return new AdaptiveTexture(img, engine);
  }

  checkUrl(url: string): boolean {
    const ext = this.getExtFromUrl(url);
    if (ext === 'json') {
      return true
    }
    console.error('When use url as params, url must be a json file');
    return false;
  }

  getExtFromUrl(url: string): string {
    return url.split(/[#?]/)[0].split('.').pop().trim();
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
    if (minFilter === TextureFilter.Nearest) {
      this.texture.filterMode = TextureFilterMode.Point;
    } else if (magFilter === TextureFilter.MipMapLinearLinear) {
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

function loadText(url: string) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.open('GET', url, true);
    request.onload = () => {
      if (request.status == 200) {
        resolve(request.response);
      } else {
        reject(`status:${request.status}, ${request.responseText}`);
      }
    }
    request.onerror = () => {
      reject(`status:${request.status}, ${request.responseText}`);
    }
    request.send();
  });
}


export { SpineLoader };
