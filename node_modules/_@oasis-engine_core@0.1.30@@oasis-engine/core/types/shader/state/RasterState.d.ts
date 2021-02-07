import { CullMode } from "../enums/CullMode";
/**
 * Raster state.
 */
export declare class RasterState {
    /** specifies whether or not front- and/or back-facing polygons can be culled. */
    cullMode: CullMode;
    /** the multiplier by which an implementation-specific value is multiplied with to create a constant depth offset. */
    depthBias: number;
    /** the scale factor for the variable depth offset for each polygon. */
    slopeScaledDepthBias: number;
    private _platformApply;
}
