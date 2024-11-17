import { 
  AssetPromise, 
  Engine, 
  request, 
  Texture2D, 
  AssetType,
  TextureFilterMode,
  TextureWrapMode,
  BufferReader,
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

export function createSpineResource(engine: Engine, skeletonRawData: string | ArrayBuffer, textureAtlas: TextureAtlas, name?: string) {
  if (typeof skeletonRawData === 'string') {
    try {
      // editor asset
      const { data } = JSON.parse(skeletonRawData);
      if (data) {
        skeletonRawData = data;
      }
    } catch {
      // origin asset
    }
  } else {
    let isEditorAsset = false;
    const reader = new BufferReader(new Uint8Array(skeletonRawData));
    try {
      const header = reader.nextStr(); // origin asset might exceed when read next str
      isEditorAsset = header.startsWith('spine');
    } catch {}
    if (isEditorAsset) {
      reader.nextStr(); // atlas id
      skeletonRawData = reader.nextImageData();
    }
  }
  const skeletonData = createSkeletonData(skeletonRawData, textureAtlas);
  return new SpineResource(engine, skeletonData, name);
}

export function createSkeletonData(
  skeletonRawData: string | ArrayBuffer,
  textureAtlas: TextureAtlas,
): SkeletonData {
  const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
  if (typeof skeletonRawData === 'string') {
    return new SkeletonJson(atlasLoader).readSkeletonData(skeletonRawData);
  } else {
    return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonRawData as ArrayBuffer));
  }
}

export function createTextureAtlas(atlasText: string, textures: Texture2D[]): TextureAtlas {
  try {
    // editor asset
    const { data, textures } = JSON.parse(atlasText);
    if (data && textures) {
      atlasText = data;
    }
  } catch {
    // origin asset
  }
  const textureAtlas = new TextureAtlas(atlasText);
  textureAtlas.pages.forEach((page, index) => {
    const engineTexture = textures.find(item => item.name === page.name) || textures[index];
    const texture = createAdaptiveTexture(engineTexture);
    page.setTexture(texture);
  });
  return textureAtlas;
}

export async function loadTexturesByPaths(
  imagePaths: string[],
  imageExtensions: string[],
  engine: Engine,
): Promise<Texture2D[]> {
  let textures: Texture2D[];
  const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath, index) => {
    const ext = imageExtensions[index];
    let imageLoaderType = AssetType.Texture2D;
    if (ext === 'ktx') {
      imageLoaderType = AssetType.KTX;
    } else if (ext === 'ktx2') {
      imageLoaderType = AssetType.KTX2;
    }
    return engine.resourceManager.load({
      url: imagePath,
      type: imageLoaderType,
    });
  });
  try {
    textures = await Promise.all(texturePromises);
  } catch (error) {
    throw error;
  }
  return textures;
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
    loadTexturePromises.push(engine.resourceManager.load({
      url: textureUrl,
      type: AssetType.Texture2D,
    }));
  }
  try {
    textures = await Promise.all(loadTexturePromises);
  } catch (err) {
    throw new Error(`Spine Texture: load error: ${err}`);
  }
  textureAtlas = createTextureAtlas(atlasText, textures);
  return textureAtlas;
}


export function createAdaptiveTexture(texture: Texture2D) {
  return new AdaptiveTexture(new Image(), texture);
}

export function getBaseUrl(url: string): string {
  const parsedUrl = new URL(url);
  const basePath = parsedUrl.origin + parsedUrl.pathname;
  return basePath.endsWith('/') ? basePath : basePath.substring(0, basePath.lastIndexOf('/') + 1);
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