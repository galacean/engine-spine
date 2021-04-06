import { Material, Shader, Engine, CullMode, BlendFactor, RenderQueueType } from 'oasis-engine';

const vertexSource = `
  uniform mat4 u_MVPMat;

  attribute vec3 POSITION; 
  attribute vec4 COLOR;
  attribute vec2 TEXCOORD;
  varying vec2 v_uv;
  varying vec4 v_color;

  void main() {
    v_uv = TEXCOORD;
    v_color = COLOR;
    gl_Position = u_MVPMat * vec4(POSITION, 1.0);
  }
  `;

const fragmentSource = `
  uniform sampler2D map;
  varying vec2 v_uv;
  varying vec4 v_color;

  void main() {
    gl_FragColor = texture2D(map, v_uv) * v_color;
  }
`;

Shader.create('spine_skeleton',vertexSource,fragmentSource)

export class SpineMaterial extends Material {
  constructor(engine: Engine) {
    super(engine, Shader.find('spine_skeleton'));
    const rasterState = this.renderState.rasterState;
    rasterState.cullMode = CullMode.Off;
    const depthState = this.renderState.depthState;
    depthState.writeEnabled = false;
    const target = this.renderState.blendState.targetBlendState;
    target.sourceColorBlendFactor = BlendFactor.SourceAlpha;
    target.destinationColorBlendFactor = BlendFactor.OneMinusSourceAlpha;
    target.sourceAlphaBlendFactor = BlendFactor.One;
    target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceAlpha;
    this.renderQueueType = RenderQueueType.Transparent;
    target.enabled = true;
  }
}