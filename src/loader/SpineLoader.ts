import { TextureAtlas } from "@esotericsoftware/spine-core";
import { AssetPromise, Loader, LoadItem, resourceLoader, ResourceManager } from "@galacean/engine";
import { LoaderUtils } from "./LoaderUtils";
import { SpineResource } from "./SpineResource";

type SpineAssetPath = {
  atlasPath: string;
  skeletonPath: string;
  extraPaths: string[];
  fileExtensions?: string | string[];
};

type SpineLoadContext = {
  fileName: string;
  spineAssetPath: SpineAssetPath;
  skeletonRawData: string | ArrayBuffer;
};

type SpineLoaderParams = {
  fileExtensions?: string | string[];
};

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
export class SpineLoader extends Loader<SpineResource> {
  private static _skeletonExtensions = ["skel", "json", "bin"];
  private static _decoder = new TextDecoder("utf-8");

  private static _groupAssetsByExtension(url: string, fileExtension: string | null, assetPath: SpineAssetPath) {
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;

    if (["skel", "json", "bin"].includes(ext)) {
      assetPath.skeletonPath = url;
    } else if (ext === "atlas") {
      assetPath.atlasPath = url;
    } else {
      assetPath.extraPaths.push(url);
    }
  }

  private static _deriveAndAssignSpineAtlas(url: string, fileExtension: string | null, assetPath: SpineAssetPath) {
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;
    assetPath.skeletonPath = url;
    const extensionPattern: RegExp = /\.(json|bin|skel)$/;
    let baseUrl: string;
    if (extensionPattern.test(url)) {
      baseUrl = url.replace(extensionPattern, "");
    }
    if (baseUrl) {
      const atlasUrl = baseUrl + ".atlas";
      assetPath.atlasPath = atlasUrl;
    }
  }

  static _normalizeFileExtensions(fileExtensions: string | string[], expectArray: boolean): string | string[] | null {
    if (expectArray) {
      return Array.isArray(fileExtensions) ? fileExtensions : [];
    } else {
      return typeof fileExtensions === "string" ? fileExtensions : null;
    }
  }

  static _getUrlExtension(url: string, fileExtension: string): string | null {
    if (fileExtension) {
      return fileExtension;
    }
    const regex = /\.(\w+)(\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  load(item: SpineLoadItem, resourceManager: ResourceManager): AssetPromise<SpineResource> {
    return new AssetPromise((resolve, reject) => {
      const spineLoadContext: SpineLoadContext = {
        fileName: "",
        skeletonRawData: "",
        spineAssetPath: {
          atlasPath: null,
          skeletonPath: null,
          extraPaths: []
        }
      };
      const { spineAssetPath } = spineLoadContext;
      let { fileExtensions } = item.params || {};
      if (!item.urls) {
        fileExtensions = SpineLoader._normalizeFileExtensions(fileExtensions, false) as string;
        SpineLoader._deriveAndAssignSpineAtlas(item.url, fileExtensions, spineAssetPath);
      } else {
        fileExtensions = SpineLoader._normalizeFileExtensions(fileExtensions, true);
        const urls = item.urls;
        for (let i = 0, len = urls.length; i < len; i += 1) {
          const url = urls[i];
          const extension = fileExtensions[i] || null;
          SpineLoader._groupAssetsByExtension(url, extension, spineAssetPath);
        }
      }
      spineAssetPath.fileExtensions = fileExtensions;

      const { skeletonPath, atlasPath } = spineAssetPath;
      if (!skeletonPath || !atlasPath) {
        reject(
          new Error(
            "Failed to load spine assets. Please check the file path and ensure the file extension is included."
          )
        );
        return;
      }

      spineLoadContext.fileName = this._extractFileName(skeletonPath);

      resourceManager
        // @ts-ignore
        ._request(skeletonPath, { type: "arraybuffer" })
        .then((skeletonRawData: ArrayBuffer) => {
          spineLoadContext.skeletonRawData = skeletonRawData;
          const skeletonString = SpineLoader._decoder.decode(skeletonRawData);
          if (skeletonString.startsWith("{")) {
            spineLoadContext.skeletonRawData = skeletonString;
          }
          return this._loadAndCreateSpineResource(spineLoadContext, resourceManager);
        })
        .then(resolve)
        .catch(reject);
    });
  }

  private _loadAndCreateSpineResource(
    spineLoadContext: SpineLoadContext,
    resourceManager: ResourceManager
  ): Promise<SpineResource> {
    const { engine } = resourceManager;
    const { skeletonRawData, spineAssetPath } = spineLoadContext;
    const { atlasPath, extraPaths } = spineAssetPath;
    let fileExtensions: string | string[] | null;
    if (spineAssetPath.fileExtensions?.length) {
      fileExtensions = (spineAssetPath.fileExtensions as string[]).filter(
        (item) => !SpineLoader._skeletonExtensions.includes(item)
      );
    }

    const atlasLoadPromise =
      extraPaths.length === 0
        ? (resourceManager.load({
            url: atlasPath,
            type: "SpineAtlas",
            params: { fileExtensions }
          }) as Promise<TextureAtlas>)
        : (resourceManager.load({
            urls: [atlasPath].concat(extraPaths),
            type: "SpineAtlas",
            params: { fileExtensions }
          }) as Promise<TextureAtlas>);

    return atlasLoadPromise.then((textureAtlas) => {
      const skeletonData = LoaderUtils.createSkeletonData(skeletonRawData, textureAtlas);
      return new SpineResource(engine, skeletonData, spineLoadContext.fileName);
    });
  }

  private _extractFileName(url: string): string {
    const match = url.match(/\/([^\/]+?)(\.[^\/]*)?$/);
    return match ? match[1] : "Spine Entity";
  }
}
