/**
 * Set which color channels can be rendered to frame buffer.
 * @remarks enumeration can be combined using bit operations.
 */
export declare enum ColorWriteMask {
    /** Do not write to any channel. */
    None = 0,
    /** Write to the red channel. */
    Red = 1,
    /** Write to the green channel. */
    Green = 2,
    /** Write to the blue channel. */
    Blue = 4,
    /** Write to the alpha channel. */
    Alpha = 8,
    /** Write to all channel. */
    All = 15
}
