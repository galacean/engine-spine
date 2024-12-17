import { TextureAtlas } from "@esotericsoftware/spine-core";
import { AssetPromise, Loader, LoadItem, resourceLoader, ResourceManager } from "@galacean/engine";
import { LoaderUtils } from "./LoaderUtils";
import { SpineLoader, SpineLoaderParams } from "./SpineLoader";

interface SpineAtlasAsset {
  atlasPath: string;
  imagePaths?: string[];
  imageExtensions?: string[];
}

@resourceLoader("SpineAtlas", ["atlas"])
export class SpineAtlasLoader extends Loader<TextureAtlas> {
  private static _groupAssetsByExtension(url: string, fileExtension: string | null, assetPath: SpineAtlasAsset) {
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;

    if (ext === "atlas") {
      assetPath.atlasPath = url;
    }
    if (["png", "jpg", "webp", "jpeg", "ktx", "ktx2"].includes(ext)) {
      assetPath.imagePaths.push(url);
      assetPath.imageExtensions.push(ext);
    }
  }

  private static _assignSpineAtlas(url: string, fileExtension: string | null, assetPath: SpineAtlasAsset) {
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;
    if (ext === "atlas") {
      assetPath.atlasPath = url;
    }
  }

  load(item: LoadItem, resourceManager: ResourceManager): AssetPromise<TextureAtlas> {
    return new AssetPromise((resolve, reject) => {
      const engine = resourceManager.engine;
      const spineAtlasAsset = {
        atlasPath: "",
        imagePaths: [],
        imageExtensions: []
      };

      const params = <SpineLoaderParams>item.params || {};
      let { fileExtensions } = params;
      if (!item.urls) {
        SpineAtlasLoader._assignSpineAtlas(
          item.url,
          SpineLoader._normalizeFileExtensions(fileExtensions, false) as string,
          spineAtlasAsset
        );
      } else {
        fileExtensions = SpineLoader._normalizeFileExtensions(fileExtensions, true);
        const urls = item.urls;
        for (let i = 0, len = urls.length; i < len; i += 1) {
          const url = urls[i];
          const extension = fileExtensions[i] || null;
          SpineAtlasLoader._groupAssetsByExtension(url, extension, spineAtlasAsset);
        }
      }

      const { atlasPath } = spineAtlasAsset;
      if (!atlasPath) {
        reject(
          new Error("Failed to load spine atlas. Please check the file path and ensure the file extension is included.")
        );
        return;
      }

      if (!item.urls) {
        const atlasPath = item.url;
        LoaderUtils.loadTextureAtlas(atlasPath, engine, reject)
          .then((textureAtlas) => {
            resolve(textureAtlas);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        const { atlasPath, imagePaths, imageExtensions } = spineAtlasAsset;
        if (imagePaths.length > 0) {
          Promise.all([
            // @ts-ignore
            resourceManager._request(atlasPath, {
              type: "text"
            }) as Promise<string>,
            LoaderUtils.loadTexturesByPaths(imagePaths, imageExtensions, engine, reject)
          ])
            .then(([atlasText, textures]) => {
              const textureAtlas = LoaderUtils.createTextureAtlas(atlasText, textures);
              resolve(textureAtlas);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          LoaderUtils.loadTextureAtlas(atlasPath, engine, reject)
            .then((textureAtlas) => {
              resolve(textureAtlas);
            })
            .catch((err) => {
              reject(err);
            });
        }
      }
    });
  }
}
