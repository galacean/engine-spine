import './SpineLoader';
import './AntGSpineLoader';
import { Loader } from '@galacean/engine';
import { SpineComponent } from './SpineComponent';

export { SpineAnimation } from './SpineAnimation';
export { AssetManager } from './spine-core/AssetManager';
export { Texture } from './spine-core/Texture';
export { TextureAtlas } from './spine-core/TextureAtlas';
export { AtlasAttachmentLoader } from './spine-core/AtlasAttachmentLoader';
export { SkeletonJson } from './spine-core/SkeletonJson';
export { SkeletonBinary } from './spine-core/SkeletonBinary';
export const version = `__buildVersion`;

Loader.registerClass('SpineAnimation', SpineComponent);

console.log(`Galacean spine version :${version}`);
