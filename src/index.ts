import "./loader/SpineLoader";
import "./loader/EditorSpineAtlasLoader";
import { Loader } from "@galacean/engine";
import { SpineAnimationRenderer } from "./SpineAnimationRenderer";
export { SpineAnimationRenderer } from "./SpineAnimationRenderer";
export { SpineResource } from "./loader/SpineResource";
export { createTextureAtlas, createSpineResource } from "./loader/LoaderUtils";
export * from "@esotericsoftware/spine-core";
export const version = `__buildVersion`;

Loader.registerClass("SpineAnimationRenderer", SpineAnimationRenderer);

console.log(`Galacean spine version: ${version}`);
