import { ConstraintData } from "./ConstraintData";
import { BoneData } from "./BoneData";
/** Stores the setup pose for a {@link TransformConstraint}.
 *
 * See [Transform constraints](http://esotericsoftware.com/spine-transform-constraints) in the Spine User Guide. */
export declare class TransformConstraintData extends ConstraintData {
    /** The bones that will be modified by this transform constraint. */
    bones: BoneData[];
    /** The target bone whose world transform will be copied to the constrained bones. */
    target: BoneData;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained rotations. */
    rotateMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained translations. */
    translateMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained scales. */
    scaleMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained shears. */
    shearMix: number;
    /** An offset added to the constrained bone rotation. */
    offsetRotation: number;
    /** An offset added to the constrained bone X translation. */
    offsetX: number;
    /** An offset added to the constrained bone Y translation. */
    offsetY: number;
    /** An offset added to the constrained bone scaleX. */
    offsetScaleX: number;
    /** An offset added to the constrained bone scaleY. */
    offsetScaleY: number;
    /** An offset added to the constrained bone shearY. */
    offsetShearY: number;
    relative: boolean;
    local: boolean;
    constructor(name: string);
}
