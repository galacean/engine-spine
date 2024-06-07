import {
  AssetPromise,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
} from "@galacean/engine";
import { SkeletonData } from "@esotericsoftware/spine-core";
import { getUrlExtension, loadAndCreateSpineSkeletonData } from "./LoaderUtils";

export type SpineAssetBundle = {
  skeletonPath: string;
  skeletonExtension: string;
  atlasPath: string;
  imagePaths: string[];
  imageExtensions: string[];
}

type SpineLoaderParams =  {
  fileExtensions?: string | string[];
}

type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };

@resourceLoader("spine", ["json", "bin", "skel"])
class SpineLoader extends Loader<SkeletonData> {
  load(
    item: SpineLoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<SkeletonData> {
    return new AssetPromise((resolve, reject) => {

      let spineAssetBundle: SpineAssetBundle = {
        skeletonPath: '',
        skeletonExtension: '',
        atlasPath: '',
        imagePaths: [],
        imageExtensions: [],
      };
      let { fileExtensions } = item.params || {};
      if (item.urls) {
        // multiple resource 
        fileExtensions = verifyFileExtensions(fileExtensions, true);
        for (let i = 0; i < item.urls.length; i += 1) {
          const url = item.urls[i];
          const extension = fileExtensions && fileExtensions[i] || null;
          parseAndAssignSpineAsset(url, extension, spineAssetBundle);
        }
      } else {
        // single resource
        const fileExtension = verifyFileExtensions(fileExtensions, false);
        deriveAndAssignSpineAsset(item.url, fileExtension as string, spineAssetBundle);
      }
      const { skeletonPath, atlasPath } = spineAssetBundle;
      if (!skeletonPath || !atlasPath) {
        reject('Failed to load spine assets. Please check the file path and ensure the file extension is included.');
        return;
      }
      loadAndCreateSpineSkeletonData(spineAssetBundle, resourceManager.engine)
      .then((skeletonData) => {
        resolve(skeletonData);
      })
      .catch((err) => {
        reject(err);
      })
    });
  }
}

function parseAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
  const imageExtension = ["png", "jpg", "webp", "jpeg", "ktx", "ktx2"];
  const skeletonExtension = ["skel", "json", "bin"];
  const ext = getUrlExtension(url, fileExtension);
  if (!ext) return;

  if (skeletonExtension.includes(ext)) {
    bundle.skeletonPath = url;
    bundle.skeletonExtension = ext;
  }
  if (ext === 'atlas') {
    bundle.atlasPath = url;
  }
  if (imageExtension.includes(ext)) {
    bundle.imagePaths.push(url);
    bundle.imageExtensions.push(ext);
  }
}

function deriveAndAssignSpineAsset(url: string, fileExtension: string | null, bundle: SpineAssetBundle) {
  const ext = getUrlExtension(url, fileExtension);
  if (!ext) return;
  bundle.skeletonPath = url;
  bundle.skeletonExtension = ext;
  const extensionPattern: RegExp = /(\.(json|bin|skel))$/;
  let baseUrl;
  if (extensionPattern.test(url)) {
    baseUrl = url.replace(extensionPattern, '');
  }
  if (baseUrl) {
    const atlasUrl = baseUrl + '.atlas';
    bundle.atlasPath = atlasUrl;
  }
}

function verifyFileExtensions(fileExtensions: string | string[], expectArray: boolean): string | string[] | null {
  if (!fileExtensions) return null;
  if (expectArray && !Array.isArray(fileExtensions)) {
    console.error('Expect fileExtensions to be an array.');
    return [];
  } else if (!expectArray && typeof fileExtensions !== 'string') {
    console.error('Expect fileExtensions to be a string.');
    return null;
  }
  return fileExtensions;
}

export { SpineLoader };
