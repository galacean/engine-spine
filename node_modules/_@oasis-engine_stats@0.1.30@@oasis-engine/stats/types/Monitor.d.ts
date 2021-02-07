export default class Monitor {
    private core;
    private doms;
    private items;
    private container;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    private createContainer;
    private createStyle;
    /**
     * Update per frame
     */
    update(): void;
    /**
     * reset all hooks
     */
    reset(): void;
    /**
     * release all hooks
     */
    release(): void;
    /**
     * destory the instance
     */
    destroy(): void;
}
