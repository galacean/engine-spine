import { CullMode, Engine, Material, RenderQueueType, Shader, BlendFactor, BlendOperation } from "@galacean/engine";
import { BlendMode } from "@esotericsoftware/spine-core";

const { SourceAlpha, One, DestinationColor, Zero, OneMinusSourceColor, OneMinusSourceAlpha } = BlendFactor;
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
    uniform sampler2D material_SpineTexture;
    uniform bool spine_PremultipliedAlpha;

    varying vec2 v_uv;
    varying vec4 v_light;

    #ifdef TWO_COLORED
      varying vec3 v_dark;
    #endif
    
    void main()
    {
      vec4 texColor = texture2D(material_SpineTexture, v_uv);
      #ifdef TWO_COLORED
        vec3 dark_nonpremult = (texColor.a - texColor.rgb) * v_dark.rgb;
        vec3 dark_premult = (1.0 - texColor.rgb) * v_dark.rgb;
        vec3 dark = mix(dark_nonpremult, dark_premult, float(spine_PremultipliedAlpha));
        vec3 light = texColor.rgb * v_light.rgb;
        gl_FragColor.rgb = dark + light;
        gl_FragColor.a = texColor.a * v_light.a;
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
