import "./loader/SpineLoader";
export { SpineAnimation } from "./SpineAnimation";
export * from "@esotericsoftware/spine-core";
export { generateTextureAtlas } from "./loader/LoaderUtils";
export const version = `__buildVersion`;

console.log(`Galacean spine version: ${version}`);
