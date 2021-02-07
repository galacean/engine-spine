import {
  Material,
  RenderTechnique,
  RenderState,
  BlendFunc,
  Component,
  Primitive,
  DataType,
  UniformSemantic,
  Engine,
  Camera,
} from 'oasis-engine';

export interface StencilStates {
  stencilTest?: boolean
  stencilOpFail?: number
  stencilOpZFail?: number
  stencilOpZPass?: number
  stencilMask?: number
  stencilFuncMask?: number
  stencilFuncRef?: number
  stencilFunc?: number
}

export interface BlendStates {
  blendEquationAlpha?: number
  blendEquation?: number
  blendDstAlpha?: number
  blendSrcAlpha?: number
  blendFuncSeparate?: number
  blendSrc?: number
  blendDst?: number
}

export interface CustomStates {
  stencil: StencilStates
  blend: BlendStates
  depthMask: boolean
}

const VERT_SHADER = `
  uniform mat4 matModelViewProjection;

  attribute vec3 a_position;
  attribute vec4 a_color;
  attribute vec2 a_uv;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vUv = a_uv;
    vColor = a_color;
    gl_Position = matModelViewProjection * vec4(a_position, 1.0);
  }
`;

const FRAG_SHADER = `
  uniform sampler2D map;
  varying vec2 vUv;
  varying vec4 vColor;
  void main(void) {
    gl_FragColor = texture2D(map, vUv) * vColor;
  }
`;

export class SkeletonMaterial extends Material {

  private _blendStates: BlendStates;
  private _stencilStates: StencilStates;
  private _depthMask: boolean;
  private _gl: WebGLRenderingContext & WebGL2RenderingContext;

  private _generateTechnique() {
    const uniforms = this.generateUniform();
    const attributes = this.generateAttributes();

    const tech = new RenderTechnique(this.name);
    tech.isValid = true;
    tech.uniforms = uniforms;
    tech.attributes = attributes;
    tech.vertexShader = VERT_SHADER;
    tech.fragmentShader = FRAG_SHADER;
    tech.states = {
      disable: [RenderState.CULL_FACE],
      enable: [RenderState.BLEND],
      // NormalBlending：默认选项，根据z-buffer正常显示纹理,这是标准混合模式，它单独使用顶层,而不将其颜色与其下面的层混合。
      functions: {
        blendFuncSeparate: [
          BlendFunc.SRC_ALPHA,
          BlendFunc.ONE_MINUS_SRC_ALPHA,
          BlendFunc.ONE,
          BlendFunc.ONE_MINUS_SRC_ALPHA
        ]
      }
    };

    this.setDepthMask(tech);
    this.setBlendStates(tech);
    this.setStencilState(tech);

    this._technique = tech;
    this.transparent = true;
  }

  private generateAttributes() {
    const attributes = {
      a_position: {
        name: 'a_position',
        semantic: "POSITION",
        type: DataType.FLOAT_VEC3
      },
      a_color: {
        name: 'a_color',
        semantic: "COLOR",
        type: DataType.FLOAT_VEC4
      },
      a_uv: {
        name: 'a_uv',
        semantic: "TEXCOORD_0",
        type: DataType.FLOAT_VEC2
      }
    };
    return attributes;
  }

  private generateUniform() {
    const uniforms = {
      map: {
        name: 'map',
        type: DataType.SAMPLER_2D
      },
      matModelViewProjection: {
        name: 'matModelViewProjection',
        semantic: UniformSemantic.MODELVIEWPROJECTION,
        type: DataType.FLOAT_MAT4
      }
    };
    return uniforms;
  }

  private setStencilState(tech: RenderTechnique) {
    const states = this._stencilStates;
    if (!states) return;
    const stencil = states.stencilTest;
    if (stencil) {
      tech.states.enable.push(this._gl.STENCIL_TEST);
      tech.states.functions.stencilFunc = [states.stencilFunc, states.stencilFuncRef, states.stencilFuncMask];
      tech.states.functions.stencilOp = [states.stencilOpFail, states.stencilOpZFail, states.stencilOpZPass];
      tech.states.functions.stencilMask = [states.stencilMask];
    } else {
      tech.states.disable.push(this._gl.STENCIL_TEST);
    }
  }

  private setBlendStates(tech: RenderTechnique) {
    const states = this._blendStates;
    if (!states) return;
    if (states.blendEquation) {
      tech.states.functions.blendEquationSeparate = [states.blendEquation, states.blendEquationAlpha];
    }
    if (!('blendDstAlpha' in states)) {
      states.blendDstAlpha = this._gl.ONE_MINUS_SRC_ALPHA;
      states.blendSrcAlpha = this._gl.ONE;
    }
    tech.states.functions.blendFuncSeparate = [states.blendSrc, states.blendDst, states.blendSrcAlpha, states.blendDstAlpha];
  }

  private setDepthMask(tech: RenderTechnique) {
    if (this._depthMask !== undefined) {
      tech.states.functions.depthMask = [this._depthMask];
    }
  }

  set map(v) {
    this.setValue('map', v);
  }
  get map() {
    return this.getValue('map');
  }

  constructor(engine: Engine, name: string, customStates: CustomStates) {
    super(engine, name);
    const hardwareRenderer = engine._hardwareRenderer;
    const gl: WebGLRenderingContext & WebGL2RenderingContext = hardwareRenderer.gl;
    this._gl = gl;
    this._blendStates = customStates.blend;
    this._stencilStates = customStates.stencil;
    this._depthMask = customStates.depthMask;
  }

  prepareDrawing(camera: Camera, component: Component, primitive: Primitive) {
    if (!this._technique) {
      this._generateTechnique();
    }

    super.prepareDrawing(camera, component, primitive);
  }
}