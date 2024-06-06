import "./loader/SpineLoader";
export { SpineRenderer } from "./SpineRenderer";
export { SpineAnimation } from "./SpineAnimation";
export { Texture } from "@esotericsoftware/spine-core";
export { TextureAtlas } from "@esotericsoftware/spine-core";
export { AtlasAttachmentLoader } from "@esotericsoftware/spine-core";
export { SkeletonJson } from "@esotericsoftware/spine-core";
export { SkeletonBinary } from "@esotericsoftware/spine-core";
export { SkeletonData } from "@esotericsoftware/spine-core";
export const version = `__buildVersion`;

console.log(`Galacean spine version: ${version}`);
