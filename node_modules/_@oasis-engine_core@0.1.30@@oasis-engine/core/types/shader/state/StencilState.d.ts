import { CompareFunction } from "../enums/CompareFunction";
import { StencilOperation } from "../enums/StencilOperation";
/**
 * Stencil state.
 */
export declare class StencilState {
    private static _getGLCompareFunction;
    private static _getGLStencilOperation;
    /** Whether to enable stencil test. */
    enabled: boolean;
    /** Write the reference value of the stencil buffer. */
    referenceValue: number;
    /** Specifying a bit-wise mask that is used to AND the reference value and the stored stencil value when the test is done. */
    mask: number;
    /** Specifying a bit mask to enable or disable writing of individual bits in the stencil planes. */
    writeMask: number;
    /** The comparison function of the reference value of the front face of the geometry and the current buffer storage value. */
    compareFunctionFront: CompareFunction;
    /** The comparison function of the reference value of the back of the geometry and the current buffer storage value. */
    compareFunctionBack: CompareFunction;
    /** specifying the function to use for front face when both the stencil test and the depth test pass. */
    passOperationFront: StencilOperation;
    /** specifying the function to use for back face when both the stencil test and the depth test pass. */
    passOperationBack: StencilOperation;
    /** specifying the function to use for front face when the stencil test fails. */
    failOperationFront: StencilOperation;
    /** specifying the function to use for back face when the stencil test fails. */
    failOperationBack: StencilOperation;
    /** specifying the function to use for front face when the stencil test passes, but the depth test fails. */
    zFailOperationFront: StencilOperation;
    /** specifying the function to use for back face when the stencil test passes, but the depth test fails. */
    zFailOperationBack: StencilOperation;
    private _platformApply;
}
