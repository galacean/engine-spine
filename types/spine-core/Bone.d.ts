import { Updatable } from "./Updatable";
import { BoneData } from "./BoneData";
import { Skeleton } from "./Skeleton";
import { Vector2 } from "./Utils";
/** Stores a bone's current pose.
 *
 * A bone has a local transform which is used to compute its world transform. A bone also has an applied transform, which is a
 * local transform that can be applied to compute the world transform. The local transform and applied transform may differ if a
 * constraint or application code modifies the world transform after it was computed from the local transform. */
export declare class Bone implements Updatable {
    /** The bone's setup pose data. */
    data: BoneData;
    /** The skeleton this bone belongs to. */
    skeleton: Skeleton;
    /** The parent bone, or null if this is the root bone. */
    parent: Bone;
    /** The immediate children of this bone. */
    children: Bone[];
    /** The local x translation. */
    x: number;
    /** The local y translation. */
    y: number;
    /** The local rotation in degrees, counter clockwise. */
    rotation: number;
    /** The local scaleX. */
    scaleX: number;
    /** The local scaleY. */
    scaleY: number;
    /** The local shearX. */
    shearX: number;
    /** The local shearY. */
    shearY: number;
    /** The applied local x translation. */
    ax: number;
    /** The applied local y translation. */
    ay: number;
    /** The applied local rotation in degrees, counter clockwise. */
    arotation: number;
    /** The applied local scaleX. */
    ascaleX: number;
    /** The applied local scaleY. */
    ascaleY: number;
    /** The applied local shearX. */
    ashearX: number;
    /** The applied local shearY. */
    ashearY: number;
    /** If true, the applied transform matches the world transform. If false, the world transform has been modified since it was
    * computed and {@link #updateAppliedTransform()} must be called before accessing the applied transform. */
    appliedValid: boolean;
    /** Part of the world transform matrix for the X axis. If changed, {@link #appliedValid} should be set to false. */
    a: number;
    /** Part of the world transform matrix for the Y axis. If changed, {@link #appliedValid} should be set to false. */
    b: number;
    /** Part of the world transform matrix for the X axis. If changed, {@link #appliedValid} should be set to false. */
    c: number;
    /** Part of the world transform matrix for the Y axis. If changed, {@link #appliedValid} should be set to false. */
    d: number;
    /** The world X position. If changed, {@link #appliedValid} should be set to false. */
    worldY: number;
    /** The world Y position. If changed, {@link #appliedValid} should be set to false. */
    worldX: number;
    sorted: boolean;
    active: boolean;
    /** @param parent May be null. */
    constructor(data: BoneData, skeleton: Skeleton, parent: Bone);
    /** Returns false when the bone has not been computed because {@link BoneData#skinRequired} is true and the
    * {@link Skeleton#skin active skin} does not {@link Skin#bones contain} this bone. */
    isActive(): boolean;
    /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
    update(): void;
    /** Computes the world transform using the parent bone and this bone's local transform.
     *
     * See {@link #updateWorldTransformWith()}. */
    updateWorldTransform(): void;
    /** Computes the world transform using the parent bone and the specified local transform. Child bones are not updated.
     *
     * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
     * Runtimes Guide. */
    updateWorldTransformWith(x: number, y: number, rotation: number, scaleX: number, scaleY: number, shearX: number, shearY: number): void;
    /** Sets this bone's local transform to the setup pose. */
    setToSetupPose(): void;
    /** The world rotation for the X axis, calculated using {@link #a} and {@link #c}. */
    getWorldRotationX(): number;
    /** The world rotation for the Y axis, calculated using {@link #b} and {@link #d}. */
    getWorldRotationY(): number;
    /** The magnitude (always positive) of the world scale X, calculated using {@link #a} and {@link #c}. */
    getWorldScaleX(): number;
    /** The magnitude (always positive) of the world scale Y, calculated using {@link #b} and {@link #d}. */
    getWorldScaleY(): number;
    /** Computes the applied transform values from the world transform. This allows the applied transform to be accessed after the
     * world transform has been modified (by a constraint, {@link #rotateWorld()}, etc).
     *
     * If {@link #updateWorldTransform()} has been called for a bone and {@link #appliedValid} is false, then
     * {@link #updateAppliedTransform()} must be called before accessing the applied transform.
     *
     * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. The applied transform after
     * calling this method is equivalent to the local tranform used to compute the world transform, but may not be identical. */
    updateAppliedTransform(): void;
    /** Transforms a point from world coordinates to the bone's local coordinates. */
    worldToLocal(world: Vector2): Vector2;
    /** Transforms a point from the bone's local coordinates to world coordinates. */
    localToWorld(local: Vector2): Vector2;
    /** Transforms a world rotation to a local rotation. */
    worldToLocalRotation(worldRotation: number): number;
    /** Transforms a local rotation to a world rotation. */
    localToWorldRotation(localRotation: number): number;
    /** Rotates the world transform the specified amount and sets {@link #appliedValid} to false.
     * {@link #updateWorldTransform()} will need to be called on any child bones, recursively, and any constraints reapplied. */
    rotateWorld(degrees: number): void;
}
