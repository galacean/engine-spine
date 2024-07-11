import "./loader/SpineLoader";
import "./loader/EditorSpineAtlasLoader";
import { Loader } from "@galacean/engine";
import { SpineAnimation } from "./SpineAnimation";
export { SpineAnimation } from "./SpineAnimation";
export { SkeletonDataResource } from "./loader/SkeletonDataResource";
export { createTextureAtlas } from "./loader/LoaderUtils";
export * from "@esotericsoftware/spine-core";
export const version = `__buildVersion`;

Loader.registerClass("SpineAnimation", SpineAnimation);

console.log(`Galacean spine version: ${version}`);
