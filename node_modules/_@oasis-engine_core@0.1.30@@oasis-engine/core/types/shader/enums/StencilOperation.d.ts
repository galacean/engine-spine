/**
 * Stencil operation mode.
 * @remarks sets the front and/or back-facing stencil test actions.
 */
export declare enum StencilOperation {
    /** Keeps the current value. */
    Keep = 0,
    /** Sets the stencil buffer value to 0. */
    Zero = 1,
    /** Sets the stencil buffer value to the reference value. */
    Replace = 2,
    /** Increments the current stencil buffer value. Clamps to the maximum representable unsigned value. */
    IncrementSaturate = 3,
    /** Decrements the current stencil buffer value. Clamps to 0. */
    DecrementSaturate = 4,
    /** Inverts the current stencil buffer value bitwise. */
    Invert = 5,
    /** Increments the current stencil buffer value. Wraps stencil buffer value to zero when incrementing the maximum representable unsigned value. */
    IncrementWrap = 6,
    /** Decrements the current stencil buffer value. Wraps stencil buffer value to the maximum representable unsigned value when decrementing a stencil buffer value of 0. */
    DecrementWrap = 7
}
