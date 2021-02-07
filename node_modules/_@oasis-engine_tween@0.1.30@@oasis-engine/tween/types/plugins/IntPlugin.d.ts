export declare const IntPlugin: {
    reset(): void;
    /**
     *
     * @param tweener
     * @param value int
     * @returns int
     */
    startValue(tweener: any, value: any): any;
    setRelativeEndValue(tweener: any): void;
    setOffsetValue(tweener: any): void;
    /**
     *
     * @param options
     * @param tweener Tweener
     * @param relative bool
     * @param getter
     * @param setter
     * @param elapsed
     * @param startValue
     * @param offsetValue
     * @param duration
     * @param inverse bool
     */
    apply(options: any, tweener: any, relative: any, getter: any, setter: any, elapsed: any, startValue: any, offsetValue: any, duration: any, inverse: any): void;
};
