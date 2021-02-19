import { Material, Component, Primitive, Engine, Camera } from 'oasis-engine';
export interface StencilStates {
    stencilTest?: boolean;
    stencilOpFail?: number;
    stencilOpZFail?: number;
    stencilOpZPass?: number;
    stencilMask?: number;
    stencilFuncMask?: number;
    stencilFuncRef?: number;
    stencilFunc?: number;
}
export interface BlendStates {
    blendEquationAlpha?: number;
    blendEquation?: number;
    blendDstAlpha?: number;
    blendSrcAlpha?: number;
    blendFuncSeparate?: number;
    blendSrc?: number;
    blendDst?: number;
}
export interface CustomStates {
    stencil: StencilStates;
    blend: BlendStates;
    depthMask: boolean;
}
export declare class SkeletonMaterial extends Material {
    private _blendStates;
    private _stencilStates;
    private _depthMask;
    private _gl;
    private _generateTechnique;
    private generateAttributes;
    private generateUniform;
    private setStencilState;
    private setBlendStates;
    private setDepthMask;
    set map(v: any);
    get map(): any;
    constructor(engine: Engine, name: string, customStates: CustomStates);
    prepareDrawing(camera: Camera, component: Component, primitive: Primitive): void;
}
