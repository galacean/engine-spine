/**
 * @class TextureHook
 */
export default class TextureHook {
    textures: number;
    private realCreateTexture;
    private realDeleteTexture;
    private hooked;
    private gl;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    private hookedCreateTexture;
    private hookedDeleteTexture;
    reset(): void;
    release(): void;
}
