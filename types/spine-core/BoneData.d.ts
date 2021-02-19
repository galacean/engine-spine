import { Color } from "./Utils";
/** Stores the setup pose for a {@link Bone}. */
export declare class BoneData {
    /** The index of the bone in {@link Skeleton#getBones()}. */
    index: number;
    /** The name of the bone, which is unique across all bones in the skeleton. */
    name: string;
    /** @returns May be null. */
    parent: BoneData;
    /** The bone's length. */
    length: number;
    /** The local x translation. */
    x: number;
    /** The local y translation. */
    y: number;
    /** The local rotation. */
    rotation: number;
    /** The local scaleX. */
    scaleX: number;
    /** The local scaleY. */
    scaleY: number;
    /** The local shearX. */
    shearX: number;
    /** The local shearX. */
    shearY: number;
    /** The transform mode for how parent world transforms affect this bone. */
    transformMode: TransformMode;
    /** When true, {@link Skeleton#updateWorldTransform()} only updates this bone if the {@link Skeleton#skin} contains this
    * bone.
    * @see Skin#bones */
    skinRequired: boolean;
    /** The color of the bone as it was in Spine. Available only when nonessential data was exported. Bones are not usually
     * rendered at runtime. */
    color: Color;
    constructor(index: number, name: string, parent: BoneData);
}
/** Determines how a bone inherits world transforms from parent bones. */
export declare enum TransformMode {
    Normal = 0,
    OnlyTranslation = 1,
    NoRotationOrReflection = 2,
    NoScale = 3,
    NoScaleOrReflection = 4
}
