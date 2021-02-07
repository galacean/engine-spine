/**
 * Depth/Stencil comparison function.
 * @remarks Specifies a function that compares incoming pixel depth/stencil to the current depth/stencil buffer value.
 */
export declare enum CompareFunction {
    /** never pass. */
    Never = 0,
    /** pass if the incoming value is less than the depth/stencil buffer value. */
    Less = 1,
    /** pass if the incoming value equals the depth/stencil buffer value. */
    Equal = 2,
    /** pass if the incoming value is less than or equal to the depth/stencil buffer value. */
    LessEqual = 3,
    /** pass if the incoming value is greater than the depth/stencil buffer value. */
    Greater = 4,
    /** pass if the incoming value is not equal to the depth/stencil buffer value. */
    NotEqual = 5,
    /** pass if the incoming value is greater than or equal to the depth/stencil buffer value. */
    GreaterEqual = 6,
    /** always pass. */
    Always = 7
}
