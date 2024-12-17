import "./loader/SpineLoader";
import "./loader/SpineAtlasLoader";

export * from "@esotericsoftware/spine-core";
export { AttachmentTools } from "./util/AttachmentTools";

import * as LoaderObject from "./loader";
import * as RendererObject from "./renderer";
export * from "./loader";
export * from "./renderer";

import { Loader } from "@galacean/engine";
for (let key in RendererObject) {
  Loader.registerClass(key, RendererObject[key]);
}
for (let key in LoaderObject) {
  Loader.registerClass(key, LoaderObject[key]);
}

export const version = `__buildVersion`;
console.log(`Galacean spine version: ${version}`);
