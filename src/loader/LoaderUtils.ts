import {
  AtlasAttachmentLoader,
  SkeletonBinary,
  SkeletonData,
  SkeletonJson,
  TextureAtlas
} from "@esotericsoftware/spine-core";
import { AssetPromise, AssetType, Engine, Texture2D } from "@galacean/engine";
import { AdaptiveTexture } from "./AdaptiveTexture";
import { SpineResource } from "./SpineResource";

/**
 * Creates a runtime Spine resource based on skeleton raw data and a Spine `TextureAtlas`.
 *
 * @param engine - The engine instance used to create the Spine resource.
 * @param skeletonRawData - The raw data of the skeleton, which can be a JSON string or binary data (`ArrayBuffer`).
 * @param textureAtlas - The `TextureAtlas` associated with the skeleton, used for texture mapping.
 * @param name - An optional name for the created Spine resource.
 * @returns A `SpineResource` instance that represents the created Spine resource.
 */
export function createSpineResource(
  engine: Engine,
  skeletonRawData: string | ArrayBuffer,
  textureAtlas: TextureAtlas,
  name?: string
): SpineResource {
  const skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
  return new SpineResource(engine, skeletonData, name);
}

/**
 * Creates a `TextureAtlas` instance from atlas text and texture data.
 *
 * @param atlasText - The atlas text data in Spine format.
 * @param textures - An array of `Texture2D` objects representing the textures referenced in the atlas.
 * @returns A `TextureAtlas` instance configured with the provided textures.
 */
export function createTextureAtlas(atlasText: string, textures: Texture2D[]): TextureAtlas {
  const textureAtlas = new TextureAtlas(atlasText);
  textureAtlas.pages.forEach((page, index) => {
    const engineTexture = textures.find((item) => item.name === page.name) || textures[index];
    const texture = new AdaptiveTexture(new Image(), engineTexture);
    page.setTexture(texture);
  });
  return textureAtlas;
}

export function createSkeletonData(skeletonRawData: string | ArrayBuffer, textureAtlas: TextureAtlas): SkeletonData {
  const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
  if (typeof skeletonRawData === "string") {
    return new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
  } else {
    return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData as ArrayBuffer));
  }
}

export function loadTexturesByPaths(
  imagePaths: string[],
  imageExtensions: string[],
  engine: Engine,
  reject: (reason?: any) => void
): Promise<Texture2D[]> {
  const resourceManager = engine.resourceManager;
  const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath, index) => {
    const ext = imageExtensions[index];
    let imageLoaderType = AssetType.Texture2D;
    if (ext === "ktx") {
      imageLoaderType = AssetType.KTX;
    } else if (ext === "ktx2") {
      imageLoaderType = AssetType.KTX2;
    }
    return resourceManager.load({
      url: imagePath,
      type: imageLoaderType
    });
  });
  return Promise.all(texturePromises).catch((error) => {
    reject(error);
    return [];
  });
}

export function loadTextureAtlas(
  atlasPath: string,
  engine: Engine,
  reject: (reason?: any) => void
): Promise<TextureAtlas> {
  const baseUrl = getBaseUrl(atlasPath);
  const resourceManager = engine.resourceManager;
  let atlasText: string;
  return (
    resourceManager
      // @ts-ignore
      ._request(atlasPath, { type: "text" })
      .then((text: string) => {
        atlasText = text;
        const textureAtlas = new TextureAtlas(atlasText);
        const loadTexturePromises = textureAtlas.pages.map((page) => {
          const textureUrl = baseUrl + page.name;
          return resourceManager.load({
            url: textureUrl,
            type: AssetType.Texture2D
          }) as Promise<Texture2D>;
        });
        return Promise.all(loadTexturePromises).then((textures) => {
          return createTextureAtlas(atlasText, textures);
        });
      })
      .catch((err) => {
        reject(new Error(`Spine Atlas: ${atlasPath} load error: ${err}`));
        return null;
      })
  );
}

export function getBaseUrl(url: string): string {
  const parsedUrl = new URL(url);
  const basePath = parsedUrl.origin + parsedUrl.pathname;
  return basePath.endsWith("/") ? basePath : basePath.substring(0, basePath.lastIndexOf("/") + 1);
}
