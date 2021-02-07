import { BlendState } from "./BlendState";
import { DepthState } from "./DepthState";
import { RasterState } from "./RasterState";
import { StencilState } from "./StencilState";
/**
 * Render state.
 */
export declare class RenderState {
    /** Blend state. */
    readonly blendState: BlendState;
    /** Depth state. */
    readonly depthState: DepthState;
    /** Stencil state. */
    readonly stencilState: StencilState;
    /** Raster state. */
    readonly rasterState: RasterState;
}
