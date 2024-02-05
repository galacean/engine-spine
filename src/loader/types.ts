import { LoadItem, AssetType } from '@galacean/engine';

export type SpineResource = {
  skeletonPath: string;
  skeletonSuffix: string;
  atlasPath: string;
  imagePaths: string[];
}

export type SpineLoaderParams =  {
  fileSuffix?: string | string[];
  imageLoaderType?: string;
}

export type SpineLoadItem = LoadItem & { params?: SpineLoaderParams };