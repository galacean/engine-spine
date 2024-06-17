import "./loader/SpineLoader";
export { SpineRenderer } from "./SpineRenderer";
export { SpineAnimation } from "./SpineAnimation";
export { AssetManager } from "./spine-core/AssetManager";
export { Texture } from "./spine-core/Texture";
export { TextureAtlas } from "./spine-core/TextureAtlas";
export { AtlasAttachmentLoader } from "./spine-core/AtlasAttachmentLoader";
export { SkeletonJson } from "./spine-core/SkeletonJson";
export { SkeletonBinary } from "./spine-core/SkeletonBinary";
export { SkeletonData } from "./spine-core/SkeletonData";
export { generateTextureAtlas } from "./loader/LoaderUtils";
export const version = `__buildVersion`;

console.log(`Galacean spine version: ${version}`);
