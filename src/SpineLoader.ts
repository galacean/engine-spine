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
  MeshRenderer,
  AssetType,
} from "@galacean/engine";
import { AssetManager } from "./spine-core/AssetManager";
import { TextureAtlas } from "./spine-core/TextureAtlas";
import { Texture, TextureFilter } from "./spine-core/Texture";
import { AtlasAttachmentLoader } from "./spine-core/AtlasAttachmentLoader";
import { SkeletonJson } from "./spine-core/SkeletonJson";
import { SkeletonBinary } from "./spine-core/SkeletonBinary";
import { SpineAnimation } from "./SpineAnimation";

type SpineResouce = {
  skeletonFile: string;
  atlasFile: string;
  textureFile?: string;
  textureType?: AssetType;
};

type SpineOpt = {
  scale: number;
};

type SpineLoadItem = LoadItem & SpineOpt;

// @ts-ignore
@resourceLoader("spine", ["json", "bin"])
class SpineLoader extends Loader<Entity> {
  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<Entity> {
    return new AssetPromise((resolve, reject) => {
      // @ts-ignore
      if (item.type !== "spine") {
        reject("Asset type must be spine.");
      }

      let resource: SpineResouce = null;

      if (item.urls) {
        this.handleResource(resourceManager, item, resource, resolve, reject);
      } else {
        this.request<any>(item.url || "", { type: "json" })
          .then((res) => {
            // 来自编辑器
            if (res.jsonUrl && res.atlasUrl && res.pngUrl) {
              resource = this.getResouceFromUrls(
                [res.jsonUrl, res.atlasUrl, res.pngUrl],
                res.pngType
              );
              console.log(res)
              this.handleResource(
                resourceManager,
                item,
                resource,
                resolve,
                reject
              );
            } else {
              this.handleResource(
                resourceManager,
                item,
                resource,
                resolve,
                reject
              );
            }
          })
          .catch((err) => {
            this.handleResource(
              resourceManager,
              item,
              resource,
              resolve,
              reject
            );
          });
      }
    });
  }

  handleResource(
    resourceManager: ResourceManager,
    item: SpineLoadItem,
    resource: SpineResouce,
    resolve,
    reject
  ) {
    const { engine } = resourceManager;

    if (!resource) {
      if (!item.urls && item.url && this.checkUrl(item.url)) {
        resource = this.getResouceFromUrl(item.url);
      }

      if (item.urls && this.checkUrls(item.urls)) {
        resource = this.getResouceFromUrls(item.urls);
      }
    }

    let autoLoadTexture: boolean = false;
    let assetManager: AssetManager;
    assetManager = new AssetManager(engine, null, (texture: Texture2D) => {
      return this.createAdaptiveTexture(texture);
    });

    const { skeletonFile, atlasFile, textureFile } = resource;

    // create spine entity on load complete
    assetManager.onLoadComplete = () => {
      try {
        let atlas: TextureAtlas;
        if (autoLoadTexture) {
          atlas = assetManager.get(atlasFile);
        } else {
          const atlasText = assetManager.get(atlasFile);
          atlas = new TextureAtlas(
            atlasText,
            this.textureAssetPicker.bind(this, assetManager, textureFile)
          );
        }
        const atlasLoader = new AtlasAttachmentLoader(atlas);
        let skeletonLoader: SkeletonJson | SkeletonBinary;
        if (this.isBinFile(skeletonFile)) {
          skeletonLoader = new SkeletonBinary(atlasLoader);
        } else {
          skeletonLoader = new SkeletonJson(atlasLoader);
        }
        const skeletonData = skeletonLoader.readSkeletonData(
          assetManager.get(skeletonFile)
        );
        const entity = new Entity(engine);
        const meshRenderer = entity.addComponent(MeshRenderer);
        const mtl = SpineAnimation.getDefaultMaterial(engine);
        meshRenderer.setMaterial(mtl);
        const spineAnimation = entity.addComponent(SpineAnimation);
        spineAnimation.setSkeletonData(skeletonData);
        resolve(entity);
      } catch (err) {
        reject(err);
      }
    };

    // load asset
    const isBinFile = this.isBinFile(skeletonFile);
    if (skeletonFile && atlasFile && textureFile) {
      if (isBinFile) {
        assetManager.loadBinary(skeletonFile, null, reject);
      } else {
        assetManager.loadText(skeletonFile, null, reject);
      }
      assetManager.loadText(atlasFile, null, reject);
      assetManager.loadEngineTexture(
        textureFile,
        resource.textureType,
        null,
        reject
      );
    } else if (skeletonFile && atlasFile && !textureFile) {
      autoLoadTexture = true;
      if (isBinFile) {
        assetManager.loadBinary(skeletonFile, null, reject);
      } else {
        assetManager.loadText(skeletonFile, null, reject);
      }
      assetManager.loadTextureAtlas(atlasFile, null, reject);
    } else {
      reject("Resouce param error");
    }
  }

  textureAssetPicker(assetManager: AssetManager, textureFile: string) {
    return assetManager.get(textureFile);
  }

  createAdaptiveTexture(texture: Texture2D) {
    return new AdaptiveTexture(texture);
  }

  isBinFile(url: string): boolean {
    const ext = this.getExtFromUrl(url);
    return ext === "bin";
  }

  checkUrl(url: string): boolean {
    const ext = this.getExtFromUrl(url);
    if (ext === "json" || ext === "bin") {
      return true;
    }
    console.error("When use url as params, url must be json or bin file");
    return false;
  }

  getResouceFromUrl(url): SpineResouce {
    const skeletonFile = url;
    const atlasSuffix = ".atlas";
    let atlasFile = url;
    let queryStringPos = atlasFile.indexOf("?");
    if (queryStringPos > 0) {
      atlasFile = atlasFile.substr(0, queryStringPos);
    }
    atlasFile = atlasFile.substr(0, atlasFile.lastIndexOf(".")) + atlasSuffix;
    return { skeletonFile, atlasFile };
  }

  checkUrls(urls: string[]): boolean {
    if (urls.length < 2) {
      console.error(
        "When use urls as params, urls should at least contain: json/bin and atlas"
      );
      return false;
    }
    if (urls.length > 3) {
      console.error("Spine runtime dont support multiple texture now");
      return false;
    }

    const { skeletonFile, atlasFile } =
      this.getResouceFromUrls(urls);
    if (skeletonFile && atlasFile) {
      return true;
    }
    console.error(
      `Lack ${skeletonFile ? "" : "skeletonFile"}${
        !atlasFile ? "" : " atlasFile"
      }`
    );
    return false;
  }

  getResouceFromUrls(
    urls: string[],
    type: AssetType = AssetType.Texture2D
  ): SpineResouce {
    let skeletonFile: string;
    let atlasFile: string;
    let textureFile: string;
    const textureType = type;
    for (let i = 0; i < urls.length; ++i) {
      const url = urls[i];
      const ext = this.getExtFromUrl(url);
      if (ext === "json" || ext === "bin") {
        skeletonFile = url;
      }
      if (ext === "atlas") {
        atlasFile = url;
      }
      const imgMap = ["png", "jpg", "webp", "jpeg", "ktx2"];
      if (imgMap.includes(ext)) {
        textureFile = url;
      }
    }
    return {
      skeletonFile,
      atlasFile,
      textureFile,
      textureType,
    };
  }

  getExtFromUrl(url: string): string {
    return url.split(/[#?]/)[0].split(".").pop().trim();
  }
}

export class AdaptiveTexture extends Texture {
  constructor(texture: Texture2D) {
    super(texture);
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

export { SpineLoader };
