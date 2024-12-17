import {
  AtlasAttachmentLoader,
  SkeletonBinary,
  SkeletonData,
  SkeletonJson,
  TextureAtlas
} from "@esotericsoftware/spine-core";
import { AssetPromise, AssetType, Engine, Texture2D } from "@galacean/engine";
import { SpineTexture } from "./SpineTexture";

/**
 * @internal
 */
export class LoaderUtils {
  static createSkeletonData(skeletonRawData: string | ArrayBuffer, textureAtlas: TextureAtlas): SkeletonData {
    const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
    if (typeof skeletonRawData === "string") {
      return new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
    } else {
      return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData as ArrayBuffer));
    }
  }

  static createTextureAtlas(atlasText: string, textures: Texture2D[]): TextureAtlas {
    const textureAtlas = new TextureAtlas(atlasText);
    textureAtlas.pages.forEach((page, index) => {
      const engineTexture = textures.find((item) => item.name === page.name) || textures[index];
      const texture = new SpineTexture(engineTexture);
      page.setTexture(texture);
    });
    return textureAtlas;
  }

  static loadTexturesByPaths(
    imagePaths: string[],
    imageExtensions: string[],
    engine: Engine,
    reject: (reason?: any) => void
  ): Promise<Texture2D[]> {
    const resourceManager = engine.resourceManager;
    const texturePromises: AssetPromise<Texture2D>[] = imagePaths.map((imagePath, index) => {
      const ext = imageExtensions[index];
      let imageLoaderType = AssetType.Texture2D;
      if (ext === "ktx") {
        imageLoaderType = AssetType.KTX;
      } else if (ext === "ktx2") {
        imageLoaderType = AssetType.KTX2;
      }
      return resourceManager.load({
        url: imagePath,
        type: imageLoaderType
      });
    });
    return Promise.all(texturePromises).catch((error) => {
      reject(error);
      return [];
    });
  }

  static loadTextureAtlas(atlasPath: string, engine: Engine, reject: (reason?: any) => void): Promise<TextureAtlas> {
    const baseUrl = LoaderUtils.getBaseUrl(atlasPath);
    const resourceManager = engine.resourceManager;
    let atlasText: string;
    return (
      resourceManager
        // @ts-ignore
        ._request(atlasPath, { type: "text" })
        .then((text: string) => {
          atlasText = text;
          const textureAtlas = new TextureAtlas(atlasText);
          const loadTexturePromises = textureAtlas.pages.map((page) => {
            const textureUrl = baseUrl + page.name;
            return resourceManager.load({
              url: textureUrl,
              type: AssetType.Texture2D
            }) as Promise<Texture2D>;
          });
          return Promise.all(loadTexturePromises).then((textures) => {
            return LoaderUtils.createTextureAtlas(atlasText, textures);
          });
        })
        .catch((err) => {
          reject(new Error(`Spine Atlas: ${atlasPath} load error: ${err}`));
          return null;
        })
    );
  }

  static getBaseUrl(url: string): string {
    const parsedUrl = new URL(url);
    const basePath = parsedUrl.origin + parsedUrl.pathname;
    return basePath.endsWith("/") ? basePath : basePath.substring(0, basePath.lastIndexOf("/") + 1);
  }
}
