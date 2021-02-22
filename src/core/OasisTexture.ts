import { Texture as ITexture } from '../spine-core/Texture';
import * as o3 from 'oasis-engine';

function createTexture(image: HTMLImageElement, engine: o3.Engine) {
  const texture = new o3.Texture2D(engine, image.width, image.height);
  texture.setImageSource(image);
  return texture;
}

function createCompressedTexture(bin: ArrayBuffer, engine: o3.Engine, atlasWidth: number, atlasHeight: number) {
  const parsedData = o3.parseSingleKTX(bin);
  let { width, height, mipmaps, engineFormat } = parsedData;
  const mipmap = mipmaps.length > 1;
  if (atlasWidth !== undefined && atlasHeight !== undefined) {
    console.log(`resize to atlas size: width: ${atlasWidth}, height: ${atlasHeight}`);
    width = atlasWidth;
    height = atlasHeight;
  }
  const texture = new o3.Texture2D(engine, width, height, engineFormat, mipmap);
  for (let miplevel = 0; miplevel < mipmaps.length; miplevel++) {
    const { width, height, data } = mipmaps[miplevel];
    texture.setPixelBuffer(data, miplevel, 0, 0, width, height);
  }
  return texture;
}

export class OasisTextrure extends ITexture {
  texture: o3.Texture2D;

  constructor(engine, data: HTMLImageElement | ArrayBuffer, atlasWidth?: number, atlasHeight?: number) {
    super(data);
    if (data.constructor === ArrayBuffer) {
      this.texture = createCompressedTexture(data as ArrayBuffer, engine, atlasWidth, atlasHeight);
      // @ts-ignore
      this._image = this.texture; // 兼容getImage().width
    } else {
      this.texture = createTexture(data as HTMLImageElement, engine);
      // @ts-ignore
      this._image = this.texture; // 兼容getImage().width
    }
  }

  setFilters(minFilter: any, magFilter: any) {
    if (minFilter === WebGLRenderingContext.NEAREST) {
      this.texture.filterMode = o3.TextureFilterMode.Point;
    } else if (magFilter === WebGLRenderingContext.LINEAR_MIPMAP_LINEAR) {
      this.texture.filterMode = o3.TextureFilterMode.Trilinear;
    } else {
      this.texture.filterMode = o3.TextureFilterMode.Bilinear;
    }
  }

  // @ts-ignore
  setWraps(uWrap: o3.TextureWrapMode, vWrap: o3.TextureWrapMode) {
    this.texture.wrapModeU = uWrap;
    this.texture.wrapModeV = vWrap;
  }

  dispose() {}
}