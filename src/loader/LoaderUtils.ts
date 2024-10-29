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

export function createSkeletonData(
  textureAtlas: TextureAtlas, 
  skeletonTextData: string | ArrayBuffer, 
  skeletonFileType: 'json' | 'skel',
): SkeletonData {
  const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
  if (skeletonFileType === 'json') {
    return new SkeletonJson(atlasLoader).readSkeletonData(skeletonTextData);
  } else {
    return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonTextData as ArrayBuffer));
  }
}

export async function loadTexturesByPath(
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
    return loadTexture(imagePath, engine, imageLoaderType);
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

export function createTextureAtlas(atlasText: string, textures: Texture2D[]) {
  const textureAtlas = new TextureAtlas(atlasText);
  textureAtlas.pages.forEach((page, index) => {
    const engineTexture = textures.find(item => item.name === page.name) || textures[index];
    const texture = createAdaptiveTexture(engineTexture);
    page.setTexture(texture);
  });
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