import { Updatable } from "./Updatable";
import { IkConstraintData } from "./IkConstraintData";
import { Bone } from "./Bone";
import { Skeleton } from "./Skeleton";
/** Stores the current pose for an IK constraint. An IK constraint adjusts the rotation of 1 or 2 constrained bones so the tip of
 * the last bone is as close to the target bone as possible.
 *
 * See [IK constraints](http://esotericsoftware.com/spine-ik-constraints) in the Spine User Guide. */
export declare class IkConstraint implements Updatable {
    /** The IK constraint's setup pose data. */
    data: IkConstraintData;
    /** The bones that will be modified by this IK constraint. */
    bones: Array<Bone>;
    /** The bone that is the IK target. */
    target: Bone;
    /** Controls the bend direction of the IK bones, either 1 or -1. */
    bendDirection: number;
    /** When true and only a single bone is being constrained, if the target is too close, the bone is scaled to reach it. */
    compress: boolean;
    /** When true, if the target is out of range, the parent bone is scaled to reach it. If more than one bone is being constrained
     * and the parent bone has local nonuniform scale, stretch is not applied. */
    stretch: boolean;
    /** A percentage (0-1) that controls the mix between the constrained and unconstrained rotations. */
    mix: number;
    /** For two bone IK, the distance from the maximum reach of the bones that rotation will slow. */
    softness: number;
    active: boolean;
    constructor(data: IkConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    /** Applies the constraint to the constrained bones. */
    apply(): void;
    update(): void;
    /** Applies 1 bone IK. The target is specified in the world coordinate system. */
    apply1(bone: Bone, targetX: number, targetY: number, compress: boolean, stretch: boolean, uniform: boolean, alpha: number): void;
    /** Applies 2 bone IK. The target is specified in the world coordinate system.
     * @param child A direct descendant of the parent bone. */
    apply2(parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, stretch: boolean, softness: number, alpha: number): void;
}
