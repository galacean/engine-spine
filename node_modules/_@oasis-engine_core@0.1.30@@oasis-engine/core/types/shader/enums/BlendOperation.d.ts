/**
 * Blend operation function.
 * @remarks defines how a new pixel is combined with a pixel.
 */
export declare enum BlendOperation {
    /** src + dst. */
    Add = 0,
    /** src - dst. */
    Subtract = 1,
    /** dst - src. */
    ReverseSubtract = 2,
    /** Minimum of source and destination. */
    Min = 3,
    /** Maximum of source and destination. */
    Max = 4
}
