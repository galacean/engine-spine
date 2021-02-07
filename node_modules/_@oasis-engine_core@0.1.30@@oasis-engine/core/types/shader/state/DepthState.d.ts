import { CompareFunction } from "../enums/CompareFunction";
/**
 * Depth state.
 */
export declare class DepthState {
    private static _getGLCompareFunction;
    /** Whether to enable the depth test. */
    enabled: boolean;
    /** Whether the depth value can be written.*/
    writeEnabled: boolean;
    /** Depth comparison function. */
    compareFunction: CompareFunction;
    private _platformApply;
}
