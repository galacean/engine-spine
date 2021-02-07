import { Tweener } from "../Tweener";
export declare const doTransform: {
    Rotate: (obj: any, endValue: any, interval: any, options?: any) => Tweener;
    Translate: (obj: any, endValue: any, interval: any, options?: any) => Tweener;
    Scale: (obj: any, endValue: any, interval: any, options?: any) => Tweener;
    DataType: (startValue: any, setter: any, endValue: any, interval: any, options?: any) => Tweener;
};
export declare const doMaterial: {
    Float: (mtl: any, endValue: any, property: string, interval: any, options?: any) => Tweener;
    Color: (mtl: any, endValue: any, property: string, interval: any, options?: any) => Tweener;
};
