import { BlendMode } from "@esotericsoftware/spine-core";
import {
  BlendFactor,
  BlendOperation,
  CullMode,
  Engine,
  Material,
  RenderQueueType,
  Shader,
  Texture2D
} from "@galacean/engine";
import { SpineAnimationRenderer } from "./SpineAnimationRenderer"; // Adjust the path as needed

const { SourceAlpha, One, DestinationColor, Zero, OneMinusSourceColor, OneMinusSourceAlpha } = BlendFactor;
const { Add } = BlendOperation;

export class SpineMaterialManager {
  private _defaultMaterial: Material;
  private static _materialCache = new Map<string, Material>();

  constructor(
    engine: Engine,
    private _renderer: SpineAnimationRenderer
  ) {
    this._defaultMaterial = new SpineMaterial(engine);
    this._renderer = _renderer;
  }

  get(texture: Texture2D, blendMode: number): Material {
    const premultipliedAlpha = this._renderer.premultipliedAlpha;
    const tintBlack = this._renderer.tintBlack;

    const key = `${texture.instanceId}_${blendMode}_${premultipliedAlpha ? 1 : 0}`;
    let cached = SpineMaterialManager._materialCache[key];
    if (!cached) {
      const template = this._defaultMaterial;
      cached = template.clone();
      this._setBlendMode(cached, blendMode, premultipliedAlpha);
    }
    cached.shaderData.setTexture("material_SpineTexture", texture);
    if (tintBlack) {
      cached.shaderData.enableMacro("TWO_COLORED");
    } else {
      cached.shaderData.disableMacro("TWO_COLORED");
    }
    return cached;
  }

  clearRendererCache(): void {
    const materialCache = SpineMaterialManager._materialCache;
    const materials = this._renderer.getMaterials();
    for (let i = 0, len = materials.length; i < len; i += 1) {
      const material = materials[i];
      const texture = material.shaderData.getTexture("material_SpineTexture");
      const blendMode = this._getBlendMode(material);
      const key = `${texture.instanceId}_${blendMode}_${this._renderer.premultipliedAlpha ? 1 : 0}`;
      materialCache.delete(key);
    }
  }

  private _setBlendMode(material: Material, blendMode: BlendMode, premultipliedAlpha: boolean) {
    const target = material.renderState.blendState.targetBlendState;
    switch (blendMode) {
      case BlendMode.Additive:
        target.sourceColorBlendFactor = premultipliedAlpha ? One : SourceAlpha;
        target.destinationColorBlendFactor = One;
        target.sourceAlphaBlendFactor = One;
        target.destinationAlphaBlendFactor = One;
        target.colorBlendOperation = target.alphaBlendOperation = Add;
        break;
      case BlendMode.Multiply:
        target.sourceColorBlendFactor = DestinationColor;
        target.destinationColorBlendFactor = OneMinusSourceAlpha;
        target.sourceAlphaBlendFactor = One;
        target.destinationAlphaBlendFactor = OneMinusSourceAlpha;
        target.colorBlendOperation = target.alphaBlendOperation = Add;
        break;
      case BlendMode.Screen:
        target.sourceColorBlendFactor = One;
        target.destinationColorBlendFactor = OneMinusSourceColor;
        target.sourceAlphaBlendFactor = One;
        target.destinationAlphaBlendFactor = OneMinusSourceColor;
        target.colorBlendOperation = target.alphaBlendOperation = Add;
        break;
      default:
        target.sourceColorBlendFactor = premultipliedAlpha ? One : SourceAlpha;
        target.destinationColorBlendFactor = OneMinusSourceAlpha;
        target.sourceAlphaBlendFactor = One;
        target.destinationAlphaBlendFactor = OneMinusSourceAlpha;
        target.colorBlendOperation = target.alphaBlendOperation = Add;
        break;
    }
  }

  private _getBlendMode(material: Material): BlendMode {
    const target = material.renderState.blendState.targetBlendState;

    if (
      target.sourceColorBlendFactor === SourceAlpha &&
      target.destinationColorBlendFactor === One &&
      target.sourceAlphaBlendFactor === One &&
      target.destinationAlphaBlendFactor === One &&
      target.colorBlendOperation === Add &&
      target.alphaBlendOperation === Add
    ) {
      return BlendMode.Additive;
    }

    if (
      target.sourceColorBlendFactor === DestinationColor &&
      target.destinationColorBlendFactor === Zero &&
      target.sourceAlphaBlendFactor === One &&
      target.destinationAlphaBlendFactor === Zero &&
      target.colorBlendOperation === Add &&
      target.alphaBlendOperation === Add
    ) {
      return BlendMode.Multiply;
    }

    if (
      target.sourceColorBlendFactor === One &&
      target.destinationColorBlendFactor === OneMinusSourceColor &&
      target.sourceAlphaBlendFactor === One &&
      target.destinationAlphaBlendFactor === OneMinusSourceColor &&
      target.colorBlendOperation === Add &&
      target.alphaBlendOperation === Add
    ) {
      return BlendMode.Screen;
    }
    return BlendMode.Normal;
  }
}

export class SpineMaterial extends Material {
  private static _spineVS = `
    uniform mat4 renderer_MVPMat;

    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    attribute vec4 COLOR_0;
    
    varying vec2 v_uv;
    varying vec4 v_light;

    #ifdef TWO_COLORED
      attribute vec4 COLOR_1;
      varying vec4 v_dark;
    #endif
    
    void main()
    {
      gl_Position = renderer_MVPMat * vec4(POSITION, 1.0);
    
      v_uv = TEXCOORD_0;
      v_light = COLOR_0;
      #ifdef TWO_COLORED
        v_dark = COLOR_1;
      #endif
    }
  `;

  private static _spineFS = `
    uniform sampler2D material_SpineTexture;

    varying vec2 v_uv;
    varying vec4 v_light;

    #ifdef TWO_COLORED
      varying vec4 v_dark;
    #endif
    
    void main()
    {
      vec4 texColor = texture2D(material_SpineTexture, v_uv);
      #ifdef TWO_COLORED
        gl_FragColor.a = texColor.a * v_light.a;
	      gl_FragColor.rgb = ((texColor.a - 1.0) * v_dark.a + 1.0 - texColor.rgb) * v_dark.rgb + texColor.rgb * v_light.rgb;
      #else
        gl_FragColor = texColor * v_light;
      #endif
    }
   `;
  constructor(engine: Engine) {
    const shader =
      Shader.find("galacean-spine-shader") ||
      Shader.create("galacean-spine-shader", SpineMaterial._spineVS, SpineMaterial._spineFS);
    super(engine, shader);
    const renderState = this.renderState;
    const target = renderState.blendState.targetBlendState;
    target.enabled = true;
    target.sourceColorBlendFactor = SourceAlpha;
    target.destinationColorBlendFactor = OneMinusSourceAlpha;
    target.sourceAlphaBlendFactor = One;
    target.destinationAlphaBlendFactor = OneMinusSourceAlpha;
    target.colorBlendOperation = target.alphaBlendOperation = Add;
    renderState.depthState.writeEnabled = false;
    renderState.rasterState.cullMode = CullMode.Off;
    renderState.renderQueueType = RenderQueueType.Transparent;
  }
}
