import {
  AssetPromise,
  Loader,
  resourceLoader,
  ResourceManager,
  LoadItem,
} from "@galacean/engine";
import { TextureAtlas } from "@esotericsoftware/spine-core";
import { generateTextureAtlas } from "./LoaderUtils";

console.log('regist EditorSpineAtlas loader');

@resourceLoader("EditorSpineAtlas", ["atlas"])
class EditorSpineAtlasLoader extends Loader<TextureAtlas> {
  load(
    item: LoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<TextureAtlas> {
    return new AssetPromise(async (resolve) => {
      const text = await this.request<string>(item.url, { type: "text" });
      const { data: atlasText, textures: textureRefs } = JSON.parse(text);
      const textureMap = {};
      // @ts-ignore
      const promises = textureRefs.map(refItem => resourceManager.getResourceByRef({ refId: refItem.refId }));
      const textures = await Promise.all(promises);
      textures.forEach((texture) => {
        textureMap[texture.name] = texture;
      });
      const textureAtlas = generateTextureAtlas(atlasText, textureMap);
      resolve(textureAtlas);
    });
  }
}

export { EditorSpineAtlasLoader };
