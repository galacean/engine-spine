import {
  AssetPromise,
  Loader,
  LoadItem,
  resourceLoader,
  ResourceManager,
} from "@galacean/engine";
import { 
  SkeletonData,
  SkeletonJson,
  SkeletonBinary,
  AtlasAttachmentLoader,
} from "@esotericsoftware/spine-core";
import { BufferReader } from "../util/BufferReader";
import { SkeletonDataResource } from "./SkeletonDataResource";

@resourceLoader("EditorSkeletonData", ["json", "skel"])
class EditorSkeletonDataLoader extends Loader<SkeletonDataResource> {
  load(
    item: LoadItem,
    resourceManager: ResourceManager,
  ): AssetPromise<SkeletonDataResource> {
    return new AssetPromise(async (resolve) => {
      let skeletonRawData: ArrayBuffer | string;
      let atlasRefId: string;
      const buffer: any = await this.request(item.url, { type: 'arraybuffer' });
      const reader = new BufferReader(new Uint8Array(buffer));
      const text = reader.nextStr();
      if (text.startsWith('data')) { // json
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(new Uint8Array(buffer));
        const { data, atlas } = JSON.parse(text);
        atlasRefId = atlas.refId;
        skeletonRawData = data;
      } else {
        atlasRefId = text;
        skeletonRawData = reader.nextImageData();
      }
      // @ts-ignore
      const textureAtlas = await resourceManager.getResourceByRef({ refId: atlasRefId });
      const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
      let skeletonData: SkeletonData;
      if (typeof skeletonRawData === 'string') {
        skeletonData = new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
      } else {
        skeletonData = new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData));
      }
      resolve(new SkeletonDataResource(resourceManager.engine, skeletonData));
    });
  }
}

export { EditorSkeletonDataLoader };
