import { 
  AssetPromise, 
  Engine, 
  request, 
  Texture2D, 
  AssetType,
  TextureFilterMode,
  TextureWrapMode,
} from "@galacean/engine";
import { 
  TextureAtlas, 
  AtlasAttachmentLoader,
  SkeletonJson,
  SkeletonBinary,
  SkeletonData,
  Texture,
  TextureFilter,
  TextureWrap,
} from "@esotericsoftware/spine-core";
import { SpineResource } from "./SpineResource";
import { BufferReader } from "../util/BufferReader";

export type SkeletonRawData = 
| string
| ArrayBuffer
| {
    atlas: { refId: string };
    data: string;
    spine: "json";
};

/**
 * Creates a Spine resource by parsing and processing the provided skeleton data and atlas.
 *
 * This function supports multiple formats for skeleton data: JSON (custom assets),
 * binary data in an ArrayBuffer, and object format with `data`, `atlas`, and `spine` properties.
 * Based on the type of skeleton data, it processes it accordingly and uses the appropriate
 * parser to generate a `SkeletonData` instance, which is then used to create a `SpineResource`.
 *
 * @param {Engine} engine - The game engine instance used for rendering and managing resources.
 * @param {SkeletonRawData} skeletonRawData - The raw skeleton data, which can be a JSON string, 
 *                                            binary ArrayBuffer, or an object with structured data.
 * @param {TextureAtlas} atlas - The texture atlas containing the sprite sheet or images 
 *                               required for the Spine skeleton.
 * 
 * @returns {SpineResource} - A new SpineResource instance containing skeleton data and animation data.
 */
export function createSpineResource(
  engine: Engine,
  skeletonRawData: SkeletonRawData,
  atlas: TextureAtlas,
): SpineResource {
  const atlasLoader = new AtlasAttachmentLoader(atlas);
  let inputSkeletonData: string | any;
  let type = 'json';
  if (typeof skeletonRawData === "string") {
    // Case 1: Skeleton data is a JSON string (spinejson), indicating it's a custom asset.
    inputSkeletonData = skeletonRawData;
  } else if (skeletonRawData instanceof ArrayBuffer) {
    // Case 2: Skeleton data is in binary format (ArrayBuffer)
    type = 'bin';
    const reader = new BufferReader(new Uint8Array(skeletonRawData));
    const header = reader.nextStr();
    if (header.startsWith('spine')) {
      // Header starts with 'spine', indicating it's an editor asset
      reader.nextStr(); // Skip atlasRefId, not needed for further processing
      skeletonRawData = reader.nextImageData();
    }
    // Header does not start with 'spine', indicating a custom asset
    // No further processing required for custom ArrayBuffer assets
    inputSkeletonData = new Uint8Array(skeletonRawData);
  } else if ("data" in skeletonRawData) {
    // Case 3: Skeleton data is an object with properties `atlas`, `data`, and `spine`
    // This structure is specific to editor assets
    inputSkeletonData = skeletonRawData.data;
  } else {
    console.error('Data is not in expected format');
    return;
  }
  let skeletonData: SkeletonData;
  if (type === 'json') {
    skeletonData =  new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
  } else {
    skeletonData =  new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData as ArrayBuffer));
  }
  return new SpineResource(engine, skeletonData);
}

/**
 * Creates a TextureAtlas instance using atlas text and an array of textures.
 *
 * This function initializes a TextureAtlas with the provided atlas text, then iterates over 
 * each page in the atlas. For each page, it finds the matching texture by name in the 
 * provided textures array or falls back to the texture at the current index. Finally, it 
 * applies an adaptive texture for each page to ensure compatibility.
 *
 * @param {string} atlasText - The spine atlas exported from spine editor
 * @param {Texture2D[]} textures - An array of galacean Texture2D.Atlas page textures are ordered according to the Texture2D array
 * @returns {TextureAtlas} - A TextureAtlas instance with each page linked to the corresponding texture.
 */
export function createTextureAtlas(atlasText: string, textures: Texture2D[]): TextureAtlas {
  try {
    // Case 1: Atlas data is a JSON string (spinejson), indicating it's an editor asset
    const { data, textures } = JSON.parse(atlasText);
    if (data && textures) {
      atlasText = data;
    }
  } catch (error) {
    // Case 2: If failed in parsing, indicating it's an custom asset.
    // No further processing required for custom atlas assets
  }
  const textureAtlas = new TextureAtlas(atlasText);
  textureAtlas.pages.forEach((page, index) => {
    const engineTexture = textures.find(item => item.name === page.name) || textures[index];
    const texture = createAdaptiveTexture(engineTexture);
    page.setTexture(texture);
  });
  return textureAtlas;
}

export async function loadTexturesByPath(
  imagePaths: string[],
  engine: Engine,
): Promise<Texture2D[]> {
  const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath) => {
    const ext = getUrlExtension(imagePath, null);
    
    if (!ext) {
      throw new Error(`Failed to load texture: Missing file extension for path ${imagePath}`);
    }

    let imageLoaderType = AssetType.Texture2D;
    if (ext === "ktx") {
      imageLoaderType = AssetType.KTX;
    } else if (ext === "ktx2") {
      imageLoaderType = AssetType.KTX2;
    }

    return loadTexture(imagePath, engine, imageLoaderType);
  });

  try {
    const textures = await Promise.all(texturePromises);
    return textures;
  } catch (error) {
    throw new Error(`Failed to load textures: ${error.message}`);
  }
}

export async function loadTextureAtlas(
  atlasPath: string, 
  engine: Engine,
): Promise<TextureAtlas> {
  const baseUrl = getBaseUrl(atlasPath);
  let atlasText: string;
  let textures: Texture2D[];
  try {
    atlasText = await request(atlasPath, { type: "text" });
  } catch (err) {
    throw new Error(`Spine Atlas: ${atlasPath} load error: ${err}`); 
  }
  let textureAtlas = new TextureAtlas(atlasText);
  const loadTexturePromises = [];
  for (let page of textureAtlas.pages) {
    const textureUrl = baseUrl + page.name;
    loadTexturePromises.push(loadTexture(textureUrl, engine));
  }
  try {
    textures = await Promise.all(loadTexturePromises);
  } catch (err) {
    throw new Error(`Spine Texture: load error: ${err}`);
  }
  textureAtlas = createTextureAtlas(atlasText, textures);
  return textureAtlas;
}

export function loadTexture(
  url: string, 
  engine: Engine,
  imageLoaderType: string = AssetType.Texture2D
): AssetPromise<Texture2D> {
  return engine.resourceManager.load<Texture2D>({ url, type: imageLoaderType });
}

export function createAdaptiveTexture(texture: Texture2D) {
  return new AdaptiveTexture(new Image(), texture);
}

export function getBaseUrl(url: string): string {
  const parsedUrl = new URL(url);
  const basePath = parsedUrl.origin + parsedUrl.pathname;
  return basePath.endsWith('/') ? basePath : basePath.substring(0, basePath.lastIndexOf('/') + 1);
}

export function getUrlExtension(url: string, fileExtension: string): string | null {
  if (fileExtension) {
    return fileExtension;
  }
  const regex = /\/([^\/?#]+)\.([a-zA-Z0-9]+)(\?|#|$)|\?[^#]*\.([a-zA-Z0-9]+)(\?|#|$)/;
  const match = url.match(regex);
  if (match) {
    return match[2] || match[4];
  }
  return null;
}

export class AdaptiveTexture extends Texture {
  texture: Texture2D;
  constructor(image: HTMLImageElement | ImageBitmap, texture: Texture2D) {
    super(image);
    this.texture = texture;
    this.texture.generateMipmaps();
  }

  // rewrite getImage function, return galacean texture2D, then attachment can get size of texture
  getImage(): any {
    return this.texture;
  }

  setFilters(minFilter: TextureFilter, magFilter: TextureFilter) {
    if (minFilter === TextureFilter.Nearest) {
      this.texture.filterMode = TextureFilterMode.Point;
    } else if (magFilter === TextureFilter.MipMapLinearLinear) {
      this.texture.filterMode = TextureFilterMode.Trilinear;
    } else {
      this.texture.filterMode = TextureFilterMode.Bilinear;
    }
  }

  setWraps(uWrap: TextureWrap, vWrap: TextureWrap) {
    this.texture.wrapModeU = this._convertWrapMode(uWrap);
    this.texture.wrapModeV = this._convertWrapMode(vWrap);
  }

  dispose() {}

  private _convertWrapMode(wrap: TextureWrap): TextureWrapMode {
    switch (wrap) {
      case TextureWrap.ClampToEdge:
          return TextureWrapMode.Clamp;
      case TextureWrap.Repeat:
          return TextureWrapMode.Repeat;
      case TextureWrap.MirroredRepeat:
          return TextureWrapMode.Mirror;
      default:
        throw new Error("Unsupported texture wrap mode.");
    }
  }
}
