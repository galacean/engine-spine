import {
  CullMode,
  Engine,
  Material,
  RenderQueueType,
  Shader,
  BlendFactor,
  BlendOperation,
  Texture2D
} from "@galacean/engine";
import { BlendMode } from "@esotericsoftware/spine-core";

const { SourceAlpha, One, DestinationColor, OneMinusSourceColor, OneMinusSourceAlpha } = BlendFactor;
const { Add } = BlendOperation;

export class SpineMaterial extends Material {
  private _blendMode: BlendMode = BlendMode.Normal;
  private static _spineVS = `
    uniform mat4 renderer_MVPMat;

    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    attribute vec4 COLOR_0;
    
    varying vec2 v_uv;
    varying vec4 v_light;

    #ifdef TWO_COLORED
      attribute vec3 COLOR_1;
      varying vec3 v_dark;
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
    #include <common>
    uniform sampler2D material_SpineTexture;
    uniform float spine_PremultipliedAlpha;

    varying vec2 v_uv;
    varying vec4 v_light;

    #ifdef TWO_COLORED
      varying vec3 v_dark;
    #endif
    
    void main()
    {
      vec4 texColor = texture2D(material_SpineTexture, v_uv);
      vec4 lightColor = sRGBToLinear(v_light);
      #ifdef TWO_COLORED
        vec4 darkColor = sRGBToLinear(vec4(v_dark, 1.0));
        vec3 dark_nonpremult = (texColor.a - texColor.rgb) * darkColor.rgb;
        vec3 dark_premult = (1.0 - texColor.rgb) * darkColor.rgb;
        vec3 dark = mix(dark_nonpremult, dark_premult, spine_PremultipliedAlpha);
        vec3 light = texColor.rgb * lightColor.rgb;
        gl_FragColor.rgb = dark + light;
        gl_FragColor.a = texColor.a * v_light.a;
      #else
        gl_FragColor = texColor * lightColor;
      #endif
    }
  `;

  /**
   * @internal
   */
  set tintBlack(enabled: boolean) {
    if (enabled) {
      this.shaderData.enableMacro("TWO_COLORED");
    } else {
      this.shaderData.disableMacro("TWO_COLORED");
    }
  }

  /**
   * @internal
   */
  set premultipliedAlpha(enabled: boolean) {
    if (enabled) {
      this.shaderData.setFloat("spine_PremultipliedAlpha", 1);
    } else {
      this.shaderData.setFloat("spine_PremultipliedAlpha", 0);
    }
  }

  /**
   * @internal
   */
  set texture(value: Texture2D) {
    this.shaderData.setTexture("material_SpineTexture", value);
  }

  constructor(engine: Engine) {
    const shader =
      Shader.find("galacean-spine-shader") ||
      Shader.create("galacean-spine-shader", SpineMaterial._spineVS, SpineMaterial._spineFS);
    super(engine, shader);
    const renderState = this.renderState;
    const target = renderState.blendState.targetBlendState;
    target.enabled = true;
    this._setBlendMode(BlendMode.Normal, false);
    renderState.depthState.writeEnabled = false;
    renderState.rasterState.cullMode = CullMode.Off;
    renderState.renderQueueType = RenderQueueType.Transparent;
  }

  /**
   * @internal
   */
  _setBlendMode(blendMode: BlendMode, premultipliedAlpha: boolean) {
    const target = this.renderState.blendState.targetBlendState;
    this._blendMode = blendMode;
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

  /**
   * @internal
   */
  _getBlendMode(): BlendMode {
    return this._blendMode;
  }
}
