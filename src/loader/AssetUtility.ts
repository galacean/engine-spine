import { 
  AssetPromise, 
  Engine, 
  request, 
  Texture2D, 
  AssetType,
  TextureFilterMode,
  TextureWrapMode,
} from "@galacean/engine";
import { SpineResource } from "./types";
import { TextureAtlas } from "../spine-core/TextureAtlas";
import { Texture, TextureFilter, TextureWrap, FakeTexture } from "../spine-core/Texture";
import { AtlasAttachmentLoader } from "../spine-core/AtlasAttachmentLoader";
import { SkeletonJson } from "../spine-core/SkeletonJson";
import { SkeletonBinary } from "../spine-core/SkeletonBinary";

export class AssetUtility {

  static async handleSkeletonAndAtlasFiles(resource: SpineResource, engine: Engine, imageLoaderType: string) {
    const { skeletonPath, skeletonSuffix, atlasPath } = resource;
    const skeletonPathLoadFunc = skeletonSuffix === 'json' ? loadText : loadBinary;
    let skeletonTextData: string | ArrayBuffer;
    let textureAtlas: TextureAtlas;
    try {
      [skeletonTextData, textureAtlas] = await Promise.all([
        skeletonPathLoadFunc(skeletonPath),
        loadTextureAtlas(atlasPath, engine, imageLoaderType),
      ]);
    } catch(error) {
      throw error;
    }
    const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
    if (skeletonSuffix === 'json') {
      return new SkeletonJson(atlasLoader).readSkeletonData(skeletonTextData);
    } else {
      return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonTextData as ArrayBuffer));
    }
  }

  static async handleAllFiles(resource: SpineResource, engine: Engine, imageLoaderType: string) {
    const { skeletonPath, atlasPath, imagePaths, skeletonSuffix } = resource;
    const skeletonPathLoadFunc = skeletonSuffix === 'json' ? loadText : loadBinary;
    let skeletonTextData: string | ArrayBuffer;
    let atlasText: string;
    let textureAtlas: TextureAtlas;
    let textures: Texture2D[];
    const resourceLoadQueue: AssetPromise<any>[] = [
      skeletonPathLoadFunc(skeletonPath),
      loadText(atlasPath),
    ];
    const texturePromises: AssetPromise<any>[] = imagePaths.map((imagePath) => loadTexture(imagePath, engine, imageLoaderType));
    resourceLoadQueue.push(AssetPromise.all(texturePromises));
    try {
      [skeletonTextData, atlasText, textures] = await Promise.all(resourceLoadQueue);
      let index = 0;
      textureAtlas = new TextureAtlas(atlasText, (path: string) => {
        // Obtain texture in sequence
        const texture = textures[index];
        index++;
        return createAdaptiveTexture(texture);
      });
    } catch (err) {
      throw err;
    }
    const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
    if (skeletonSuffix === 'json') {
      return new SkeletonJson(atlasLoader).readSkeletonData(skeletonTextData);
    } else {
      return new SkeletonBinary(atlasLoader).readSkeletonData(new Uint8Array(skeletonTextData as ArrayBuffer));
    }
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
  imageLoaderType: string = AssetType.Texture2D
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
    loadTexturePromises.push(loadTexture(textureUrl, engine, imageLoaderType));
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

function createAdaptiveTexture(texture: Texture2D) {
  return new AdaptiveTexture(new Image(), texture);
}

export function getUrlSuffix(url: string, fileSuffix?: string): string | null {
  if (fileSuffix) {
    return fileSuffix;
  }

  if (url.startsWith('blob:')) {
    return null;
  }

  const regex = /\/([^\/?#]+)\.([a-zA-Z0-9]+)(\?|#|$)/;
  const match = url.match(regex);
  if (match && match[2]) {
    return match[2]; // 返回匹配到的文件后缀
  } else {
    return null; // 如果没有匹配到，返回null
  }
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
