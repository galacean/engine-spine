/**
 * @class ShaderHook
 */
export default class ShaderHook {
    shaders: number;
    private realAttachShader;
    private realDetachShader;
    private hooked;
    private gl;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    private hookedAttachShader;
    private hookedDetachShader;
    reset(): void;
    release(): void;
}
