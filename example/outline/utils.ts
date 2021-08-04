import {
  Engine,
  Material,
  Shader,
  BlendFactor,
  RenderQueueType,
  CullMode,
  Vector4,
} from 'oasis-engine';

const defaultOptions = {
  color: new Vector4(1.0, 1.0, 1.0, 1.0),
  depthTest: true,
  blend: false,
  doubleSide: false
};

type Option = typeof defaultOptions;

// 顶点着色器
const VERT_SHADER = `
uniform mat4 u_MVPMat;
attribute vec3 POSITION;
void main() {
  gl_Position = u_MVPMat * vec4(POSITION, 1.0);
}
`;

// 片元着色器
const FRAG_SHADER = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

Shader.create('outline-shader', VERT_SHADER, FRAG_SHADER);

export function createGeometryMaterial(engine: Engine, options: Partial<Option> = {}) {
  options = { ...defaultOptions, ...options };
  const material = new Material(engine, Shader.find("outline-shader"));
  material.shaderData.setVector4("u_color", options.color);

  if (options.doubleSide) {
    material.renderState.rasterState.cullMode = CullMode.Off;
  }
  if (!options.depthTest) {
    material.renderState.depthState.enabled = false;
  }

  if (options.blend) {
    const { renderState } = material;
    const target = renderState.blendState.targetBlendState;
    target.sourceColorBlendFactor = target.sourceAlphaBlendFactor = BlendFactor.SourceAlpha;
    target.destinationColorBlendFactor = target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceAlpha;
    renderState.depthState.writeEnabled = false;

    material.renderQueueType = RenderQueueType.Transparent;
  }
  return material;
}