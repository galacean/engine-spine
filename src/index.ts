import "./loader/SpineLoader";
import "./loader/EditorSpineAtlasLoader";
export { SpineAnimation } from "./SpineAnimation";
export { SkeletonDataResource } from "./loader/SkeletonDataResource";
export { createTextureAtlas } from "./loader/LoaderUtils";
export * from "@esotericsoftware/spine-core";
export const version = `__buildVersion`;

console.log(`Galacean spine version: ${version}`);
