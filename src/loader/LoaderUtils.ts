import {
  AtlasAttachmentLoader,
  SkeletonBinary,
  SkeletonData,
  SkeletonJson,
  TextureAtlas
} from "@esotericsoftware/spine-core";
import { AssetPromise, AssetType, Engine, Texture2D } from "@galacean/engine";

export class LoaderUtils {
  /**
   * @internal
   */
  static _createSkeletonData(skeletonRawData: string | ArrayBuffer, textureAtlas: TextureAtlas): SkeletonData {
    const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
    if (typeof skeletonRawData === "string") {
      return new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
    } else {
      return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData as ArrayBuffer));
    }
  }

  /**
   * @internal
   */
  static _loadTexturesByPaths(
    imagePaths: string[],
    imageExtensions: string[],
    engine: Engine,
    reject: (reason?: any) => void
  ): Promise<Texture2D[]> {
    const resourceManager = engine.resourceManager;
    const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath, index) => {
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

  /**
   * @internal
   */
  static _loadTextureAtlas(atlasPath: string, engine: Engine, reject: (reason?: any) => void): Promise<TextureAtlas> {
    const baseUrl = LoaderUtils._getBaseUrl(atlasPath);
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
            return createTextureAtlas(atlasText, textures);
          });
        })
        .catch((err) => {
          reject(new Error(`Spine Atlas: ${atlasPath} load error: ${err}`));
          return null;
        })
    );
  }

  /**
   * @internal
   */
  static _getBaseUrl(url: string): string {
    const parsedUrl = new URL(url);
    const basePath = parsedUrl.origin + parsedUrl.pathname;
    return basePath.endsWith("/") ? basePath : basePath.substring(0, basePath.lastIndexOf("/") + 1);
  }
}
