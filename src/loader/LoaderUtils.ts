import { 
  AssetPromise, 
  Engine, 
  request, 
  Texture2D, 
  AssetType,
  TextureFilterMode,
  TextureWrapMode,
} from "@galacean/engine";
import { TextureAtlas } from "../spine-core/TextureAtlas";
import { Texture, TextureFilter, TextureWrap, FakeTexture } from "../spine-core/Texture";
import { AtlasAttachmentLoader } from "../spine-core/AtlasAttachmentLoader";
import { SkeletonJson } from "../spine-core/SkeletonJson";
import { SkeletonBinary } from "../spine-core/SkeletonBinary";
import { SkeletonData } from "../spine-core/SkeletonData";
import { SpineAssetBundle } from "./SpineLoader";


export async function loadAndCreateSpineSkeletonData(
  bundle: SpineAssetBundle,
  engine: Engine,
): Promise<SkeletonData> {
  const { skeletonPath, atlasPath, imagePaths, skeletonExtension, imageExtensions } = bundle;
  const skeletonLoadFunc = skeletonExtension === 'json' ? loadText : loadBinary;
  let skeletonTextData: string | ArrayBuffer;
  let textureAtlas: TextureAtlas;
  if (imagePaths.length > 0) {
    let atlasText: string;
    let textures: Texture2D[];
    const loadQueue: AssetPromise<any>[] = [
      skeletonLoadFunc(skeletonPath),
      loadText(atlasPath),
    ];
    const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath, index) => {
      const ext = imageExtensions[index];
      let imageLoaderType = AssetType.Texture2D;
      if (ext === 'ktx') imageLoaderType = AssetType.KTX;
      if (ext === 'ktx2') imageLoaderType = AssetType.KTX2;
      return loadTexture(imagePath, engine, imageLoaderType);
    });
    loadQueue.push(AssetPromise.all(texturePromises));
    try {
      [skeletonTextData, atlasText, textures] = await Promise.all(loadQueue);
      let index = 0;
      textureAtlas = new TextureAtlas(atlasText, () => {
        // Obtain texture in sequence
        const texture = textures[index];
        index++;
        return createAdaptiveTexture(texture);
      });
    } catch (error) {
      throw error;
    }
  } else {
    try {
      [skeletonTextData, textureAtlas] = await Promise.all([
        skeletonLoadFunc(skeletonPath),
        loadTextureAtlas(atlasPath, engine),
      ]);
    } catch(error) {
      throw error;
    }
  }
  const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
  if (skeletonExtension === 'json') {
    return new SkeletonJson(atlasLoader).readSkeletonData(skeletonTextData);
  } else {
    return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonTextData as ArrayBuffer));
  }
}

function loadText(url: string): AssetPromise<string> {
  return request(url, { type: "text" });
}

function loadBinary(url: string): AssetPromise<ArrayBuffer> {
  return request(url, { type: "arraybuffer" });
}

function loadTexture(
  url: string, 
  engine: Engine, 
  imageLoaderType: string = AssetType.Texture2D
): AssetPromise<Texture2D> {
  return engine.resourceManager.load<Texture2D>({ url, type: imageLoaderType });
}

async function loadTextureAtlas(
  url: string, 
  engine: Engine,
): Promise<TextureAtlas> {
  const textureUrls: string[] = [];
  const baseUrl = getBaseUrl(url);
  let atlasData: string;
  let textures: Texture2D[];
  const texturesMap: { [key: string]: Texture2D } = {};
  try {
    atlasData = await loadText(url);
  } catch (err) {
    throw new Error(`Spine Atlas: ${url} load error: ${err}`); 
  }
  try {
    new TextureAtlas(atlasData, (path: string) => {
      textureUrls.push(baseUrl + path);
      return new FakeTexture(new Image());
    });
  } catch (err) {
    throw new Error(`Spine Atlas: ${url} read error: ${err}`); 
  }
  const loadTexturePromises = [];
  for (let textureUrl of textureUrls) {
    loadTexturePromises.push(loadTexture(textureUrl, engine));
  }
  try {
    textures = await Promise.all(loadTexturePromises);
  } catch (err) {
    throw new Error(`Spine Texture: ${url} load error: ${err}`);
  }
  textures.forEach((texture, index) => {
    const key = textureUrls[index];
    texturesMap[key] = texture;
  });
  const textureAtlas = new TextureAtlas(atlasData, (path: string) => createAdaptiveTexture(texturesMap[baseUrl + path]));
  return textureAtlas;
}

export function generateTextureAtlas(atlasText: string, texturesMap: Record<string, Texture2D>) {
  const textureAtlas = new TextureAtlas(atlasText, (path: string) => createAdaptiveTexture(texturesMap[path]));
  return textureAtlas;
}

function createAdaptiveTexture(texture: Texture2D) {
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

export function getUrlExtension(url: string, extension?: string): string | null {
  if (extension) {
    return extension;
  }
  if (url.startsWith('blob:')) {
    return null;
  }
  const regex = /\/([^\/?#]+)\.([a-zA-Z0-9]+)(\?|#|$)/;
  const match = url.match(regex);
  if (match && match[2]) {
    return match[2];
  } else {
    return null;
  }
}
