import "./loader/SpineLoader";
import "./loader/EditorSpineAtlasLoader";
import { Loader } from "@galacean/engine";
import { SpineAnimationRenderer } from "./SpineAnimationRenderer";
export { SpineAnimationRenderer } from "./SpineAnimationRenderer";
export { SkeletonDataResource } from "./loader/SkeletonDataResource";
export { createTextureAtlas } from "./loader/LoaderUtils";
export * from "@esotericsoftware/spine-core";
export const version = `__buildVersion`;

Loader.registerClass("SpineAnimationRenderer", SpineAnimationRenderer);

console.log(`Galacean spine version: ${version}`);
