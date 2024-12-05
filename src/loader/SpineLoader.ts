import { SkeletonData, TextureAtlas } from "@esotericsoftware/spine-core";
import {
  AssetPromise,
  BufferReader,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
  Texture2D,
} from "@galacean/engine";
import {
  createSkeletonData,
  createTextureAtlasWithOriginAsset,
  loadTextureAtlas,
  loadTexturesByPaths,
} from "./LoaderUtils";
import { SpineResource } from "./SpineResource";

type SpineAssetPath = {
  skeletonPath: string;
  atlasPath: string;
  imagePaths: string[];
  imageExtensions: string[];
};

type SpineLoadContext = {
  fileName: string;
  atlasRefId?: string;
  isSingleUrl: boolean;
  spineAssetPath: SpineAssetPath;
  skeletonRawData: string | ArrayBuffer;
};

type SpineLoaderParams = {
  fileExtensions?: string | string[];
};

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
export class SpineLoader extends Loader<SpineResource> {
  private static _imageExtensions = [
    "png",
    "jpg",
    "webp",
    "jpeg",
    "ktx",
    "ktx2",
  ];
  private static _skeletonExtensions = ["skel", "json", "bin"];
  private static _BINARY_PREFIX = "spine:skel";
  private static _decoder = new TextDecoder("utf-8");

  /** @internal */
  static _JSON_PREFIX = '{"spine":"json"';

  /** @internal */
  static _ATLAS_PREFIX = '{"data":"';

  /** @internal */
  static _isEditorBinary(reader: BufferReader): boolean {
    const currentPosition = reader.position;
    if (currentPosition + 2 > reader.data.byteLength) {
      return false;
    }
    const strByteLength = reader["_dataView"].getUint16(currentPosition, true);
    if (
      currentPosition + 2 + strByteLength <= reader.data.byteLength &&
      reader.nextStr() === SpineLoader._BINARY_PREFIX
    ) {
      return true;
    }
  }

  /** @internal */
  static _isEditorJson(skeletonString: string): boolean {
    return skeletonString.startsWith(SpineLoader._JSON_PREFIX);
  }

  private static _parseAndAssignSpineAsset(
    url: string,
    fileExtension: string | null,
    assetPath: SpineAssetPath
  ) {
    const { _imageExtensions, _skeletonExtensions } = SpineLoader;
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;

    if (_skeletonExtensions.includes(ext)) {
      assetPath.skeletonPath = url;
    }
    if (ext === "atlas") {
      assetPath.atlasPath = url;
    }
    if (_imageExtensions.includes(ext)) {
      assetPath.imagePaths.push(url);
      assetPath.imageExtensions.push(ext);
    }
  }

  private static _deriveAndAssignSpineAtlas(
    url: string,
    fileExtension: string | null,
    assetPath: SpineAssetPath
  ) {
    const ext = SpineLoader._getUrlExtension(url, fileExtension);
    if (!ext) return;
    assetPath.skeletonPath = url;
    const extensionPattern: RegExp = /(\.(json|bin|skel))$/;
    let baseUrl: string;
    if (extensionPattern.test(url)) {
      baseUrl = url.replace(extensionPattern, "");
    }
    if (baseUrl) {
      const atlasUrl = baseUrl + ".atlas";
      assetPath.atlasPath = atlasUrl;
    }
  }

  private static _normalizeFileExtensions(
    fileExtensions: string | string[],
    expectArray: boolean
  ): string | string[] | null {
    if (expectArray) {
      return Array.isArray(fileExtensions) ? fileExtensions : [];
    } else {
      return typeof fileExtensions === "string" ? fileExtensions : null;
    }
  }

  private static _getUrlExtension(
    url: string,
    fileExtension: string
  ): string | null {
    if (fileExtension) {
      return fileExtension;
    }
    const regex =
      /\/([^\/?#]+)\.([a-zA-Z0-9]+)(\?|#|$)|\?[^#]*\.([a-zA-Z0-9]+)(\?|#|$)/;
    const match = url.match(regex);
    if (match) {
      return match[2] || match[4];
    }
    return null;
  }

  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<SpineResource> {
    return new AssetPromise(async (resolve, reject) => {
      const spineLoadContext: SpineLoadContext = {
        fileName: "",
        skeletonRawData: "",
        isSingleUrl: !item.urls,
        spineAssetPath: {
          skeletonPath: "",
          atlasPath: "",
          imagePaths: [],
          imageExtensions: [],
        },
      };
      const { spineAssetPath, isSingleUrl } = spineLoadContext;
      let { fileExtensions } = item.params || {};
      if (isSingleUrl) {
        const fileExtension = SpineLoader._normalizeFileExtensions(
          fileExtensions,
          false
        );
        SpineLoader._deriveAndAssignSpineAtlas(
          item.url,
          fileExtension as string,
          spineAssetPath
        );
      } else {
        fileExtensions = SpineLoader._normalizeFileExtensions(
          fileExtensions,
          true
        );
        const urls = item.urls;
        const urlsLen = urls.length;
        for (let i = 0; i < urlsLen; i += 1) {
          const url = urls[i];
          const extension = fileExtensions[i] || null;
          SpineLoader._parseAndAssignSpineAsset(url, extension, spineAssetPath);
        }
      }

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

      let skeletonRawData: ArrayBuffer | string;
      try {
        // @ts-ignore
        skeletonRawData = (await resourceManager._request(skeletonPath, {
          type: "arraybuffer",
        })) as ArrayBuffer;
      } catch (err) {
        reject(err);
        return;
      }
      spineLoadContext.skeletonRawData = skeletonRawData;

      const skeletonString = SpineLoader._decoder.decode(skeletonRawData);

      let isEditorAsset = false;

      if (skeletonString.startsWith("{")) {
        if (skeletonString.startsWith(SpineLoader._JSON_PREFIX)) {
          // isEditorJson
          isEditorAsset = true;
          const {
            data,
            atlas: { refId },
          } = JSON.parse(skeletonString);
          spineLoadContext.skeletonRawData = data;
          spineLoadContext.atlasRefId = refId;
        } else {
          spineLoadContext.skeletonRawData = skeletonString;
        }
      } else {
        const reader = new BufferReader(
          new Uint8Array(skeletonRawData as ArrayBuffer)
        );
        if (SpineLoader._isEditorBinary(reader)) {
          isEditorAsset = true;
          spineLoadContext.atlasRefId = reader.nextStr();
          spineLoadContext.skeletonRawData = reader.nextImageData();
        }
      }

      let resource: SpineResource;
      if (isEditorAsset) {
        resource = await this._handleEditorAsset(
          spineLoadContext,
          resourceManager,
          reject
        );
      } else {
        resource = await this._handleOriginAsset(
          spineLoadContext,
          resourceManager,
          reject
        );
      }
      resolve(resource);
    });
  }

  private async _handleEditorAsset(
    spineLoadContext: SpineLoadContext,
    resourceManager: ResourceManager,
    reject: (reason?: any) => void
  ): Promise<SpineResource> {
    let textureAtlas: TextureAtlas;
    try {
      // @ts-ignore
      textureAtlas = await resourceManager.getResourceByRef({
        refId: spineLoadContext.atlasRefId,
      });
    } catch (err) {
      reject(err);
      return;
    }
    const { skeletonRawData, fileName } = spineLoadContext;
    const skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    return new SpineResource(resourceManager.engine, skeletonData, fileName);
  }

  private async _handleOriginAsset(
    spineLoadContext: SpineLoadContext,
    resourceManager: ResourceManager,
    reject: (reason?: any) => void
  ): Promise<SpineResource> {
    const { engine } = resourceManager;
    let skeletonData: SkeletonData;
    let textureAtlas: TextureAtlas;
    const { isSingleUrl, spineAssetPath, skeletonRawData } = spineLoadContext;
    if (isSingleUrl) {
      const { atlasPath } = spineAssetPath;
      try {
        textureAtlas = await loadTextureAtlas(atlasPath, engine, reject);
      } catch (err) {
        reject(err);
        return;
      }
      skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    } else {
      const { atlasPath, imagePaths, imageExtensions } = spineAssetPath;
      let atlasText: string;
      let textures: Texture2D[];
      let textureAtlas: TextureAtlas;
      try {
        if (imagePaths.length > 0) {
          [atlasText, textures] = await Promise.all([
            // @ts-ignore
            resourceManager._request(atlasPath, {
              type: "text",
            }) as Promise<string>,
            loadTexturesByPaths(imagePaths, imageExtensions, engine, reject),
          ]);
          textureAtlas = createTextureAtlasWithOriginAsset(atlasText, textures);
        } else {
          textureAtlas = await loadTextureAtlas(atlasPath, engine, reject);
        }
      } catch (err) {
        reject(err);
        return;
      }
      console.log(skeletonRawData);
      skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
    }
    return new SpineResource(engine, skeletonData, spineLoadContext.fileName);
  }

  private _extractFileName(url: string): string {
    const match = url.match(/\/([^\/]+?)(\.[^\/]*)?$/);
    return match ? match[1] : "Spine Entity";
  }
}
