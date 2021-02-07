import { Updatable } from "./Updatable";
import { TransformConstraintData } from "./TransformConstraintData";
import { Bone } from "./Bone";
import { Skeleton } from "./Skeleton";
import { Vector2 } from "./Utils";
/** Stores the current pose for a transform constraint. A transform constraint adjusts the world transform of the constrained
 * bones to match that of the target bone.
 *
 * See [Transform constraints](http://esotericsoftware.com/spine-transform-constraints) in the Spine User Guide. */
export declare class TransformConstraint implements Updatable {
    /** The transform constraint's setup pose data. */
    data: TransformConstraintData;
    /** The bones that will be modified by this transform constraint. */
    bones: Array<Bone>;
    /** The target bone whose world transform will be copied to the constrained bones. */
    target: Bone;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained rotations. */
    rotateMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained translations. */
    translateMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained scales. */
    scaleMix: number;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained scales. */
    shearMix: number;
    temp: Vector2;
    active: boolean;
    constructor(data: TransformConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    /** Applies the constraint to the constrained bones. */
    apply(): void;
    update(): void;
    applyAbsoluteWorld(): void;
    applyRelativeWorld(): void;
    applyAbsoluteLocal(): void;
    applyRelativeLocal(): void;
}
