import "./loader/SpineLoader";
import { Loader } from "@galacean/engine";
import { SpineRenderer } from "./SpineRenderer";

export { SpineRenderer } from "./SpineRenderer";
export { SpineAnimation } from "./SpineAnimation";
export { AssetManager } from "./spine-core/AssetManager";
export { Texture } from "./spine-core/Texture";
export { TextureAtlas } from "./spine-core/TextureAtlas";
export { AtlasAttachmentLoader } from "./spine-core/AtlasAttachmentLoader";
export { SkeletonJson } from "./spine-core/SkeletonJson";
export { SkeletonBinary } from "./spine-core/SkeletonBinary";
export { SkeletonData } from "./spine-core/SkeletonData";
export const version = `__buildVersion`;

Loader.registerClass("SpineRenderer", SpineRenderer);

console.log(`Galacean spine version: ${version}`);
