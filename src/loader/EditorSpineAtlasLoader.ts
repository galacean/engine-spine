import {
  AssetPromise,
  Loader,
  resourceLoader,
  ResourceManager,
  LoadItem,
} from "@galacean/engine";
import { TextureAtlas } from "@esotericsoftware/spine-core";
import { createTextureAtlas } from "./LoaderUtils";


@resourceLoader("EditorSpineAtlas", ["atlas"])
class EditorSpineAtlasLoader extends Loader<TextureAtlas> {
  load(
    item: LoadItem,
    resourceManager: ResourceManager
  ): AssetPromise<TextureAtlas> {
    return new AssetPromise(async (resolve) => {
      // @ts-ignore
      const text = await resourceManager._request<string>(item.url, { type: "text" });
      const { data: atlasText, textures: textureRefs } = JSON.parse(text);
      // @ts-ignore
      const promises = textureRefs.map(refItem => resourceManager.getResourceByRef({ refId: refItem.refId }));
      const textures = await Promise.all(promises);
      const textureAtlas = createTextureAtlas(atlasText, textures);
      resolve(textureAtlas);
    });
  }
}

export { EditorSpineAtlasLoader };
