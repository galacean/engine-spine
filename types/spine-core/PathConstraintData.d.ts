import { ConstraintData } from "./ConstraintData";
import { BoneData } from "./BoneData";
import { SlotData } from "./SlotData";
/** Stores the setup pose for a {@link PathConstraint}.
 *
 * See [Path constraints](http://esotericsoftware.com/spine-path-constraints) in the Spine User Guide. */
export declare class PathConstraintData extends ConstraintData {
    /** The bones that will be modified by this path constraint. */
    bones: BoneData[];
    /** The slot whose path attachment will be used to constrained the bones. */
    target: SlotData;
    /** The mode for positioning the first bone on the path. */
    positionMode: PositionMode;
    /** The mode for positioning the bones after the first bone on the path. */
    spacingMode: SpacingMode;
    /** The mode for adjusting the rotation of the bones. */
    rotateMode: RotateMode;
    /** An offset added to the constrained bone rotation. */
    offsetRotation: number;
    /** The position along the path. */
    position: number;
    /** The spacing between bones. */
    spacing: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained rotations. */
    rotateMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained translations. */
    translateMix: number;
    constructor(name: string);
}
/** Controls how the first bone is positioned along the path.
 *
 * See [Position mode](http://esotericsoftware.com/spine-path-constraints#Position-mode) in the Spine User Guide. */
export declare enum PositionMode {
    Fixed = 0,
    Percent = 1
}
/** Controls how bones after the first bone are positioned along the path.
 *
 * [Spacing mode](http://esotericsoftware.com/spine-path-constraints#Spacing-mode) in the Spine User Guide. */
export declare enum SpacingMode {
    Length = 0,
    Fixed = 1,
    Percent = 2
}
/** Controls how bones are rotated, translated, and scaled to match the path.
 *
 * [Rotate mode](http://esotericsoftware.com/spine-path-constraints#Rotate-mod) in the Spine User Guide. */
export declare enum RotateMode {
    Tangent = 0,
    Chain = 1,
    ChainScale = 2
}
