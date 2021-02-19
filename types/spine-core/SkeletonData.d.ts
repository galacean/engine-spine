import { BoneData } from "./BoneData";
import { SlotData } from "./SlotData";
import { Skin } from "./Skin";
import { EventData } from "./EventData";
import { IkConstraintData } from "./IkConstraintData";
import { TransformConstraintData } from "./TransformConstraintData";
import { PathConstraintData } from "./PathConstraintData";
import { Animation } from "./Animation";
/** Stores the setup pose and all of the stateless data for a skeleton.
 *
 * See [Data objects](http://esotericsoftware.com/spine-runtime-architecture#Data-objects) in the Spine Runtimes
 * Guide. */
export declare class SkeletonData {
    /** The skeleton's name, which by default is the name of the skeleton data file, if possible. May be null. */
    name: string;
    /** The skeleton's bones, sorted parent first. The root bone is always the first bone. */
    bones: BoneData[];
    /** The skeleton's slots. */
    slots: SlotData[];
    skins: Skin[];
    /** The skeleton's default skin. By default this skin contains all attachments that were not in a skin in Spine.
     *
     * See {@link Skeleton#getAttachmentByName()}.
     * May be null. */
    defaultSkin: Skin;
    /** The skeleton's events. */
    events: EventData[];
    /** The skeleton's animations. */
    animations: Animation[];
    /** The skeleton's IK constraints. */
    ikConstraints: IkConstraintData[];
    /** The skeleton's transform constraints. */
    transformConstraints: TransformConstraintData[];
    /** The skeleton's path constraints. */
    pathConstraints: PathConstraintData[];
    /** The X coordinate of the skeleton's axis aligned bounding box in the setup pose. */
    x: number;
    /** The Y coordinate of the skeleton's axis aligned bounding box in the setup pose. */
    y: number;
    /** The width of the skeleton's axis aligned bounding box in the setup pose. */
    width: number;
    /** The height of the skeleton's axis aligned bounding box in the setup pose. */
    height: number;
    /** The Spine version used to export the skeleton data, or null. */
    version: string;
    /** The skeleton data hash. This value will change if any of the skeleton data has changed. May be null. */
    hash: string;
    /** The dopesheet FPS in Spine. Available only when nonessential data was exported. */
    fps: number;
    /** The path to the images directory as defined in Spine. Available only when nonessential data was exported. May be null. */
    imagesPath: string;
    /** The path to the audio directory as defined in Spine. Available only when nonessential data was exported. May be null. */
    audioPath: string;
    /** Finds a bone by comparing each bone's name. It is more efficient to cache the results of this method than to call it
     * multiple times.
     * @returns May be null. */
    findBone(boneName: string): BoneData;
    findBoneIndex(boneName: string): number;
    /** Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
     * multiple times.
     * @returns May be null. */
    findSlot(slotName: string): SlotData;
    findSlotIndex(slotName: string): number;
    /** Finds a skin by comparing each skin's name. It is more efficient to cache the results of this method than to call it
     * multiple times.
     * @returns May be null. */
    findSkin(skinName: string): Skin;
    /** Finds an event by comparing each events's name. It is more efficient to cache the results of this method than to call it
     * multiple times.
     * @returns May be null. */
    findEvent(eventDataName: string): EventData;
    /** Finds an animation by comparing each animation's name. It is more efficient to cache the results of this method than to
     * call it multiple times.
     * @returns May be null. */
    findAnimation(animationName: string): Animation;
    /** Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
     * than to call it multiple times.
     * @return May be null. */
    findIkConstraint(constraintName: string): IkConstraintData;
    /** Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
     * this method than to call it multiple times.
     * @return May be null. */
    findTransformConstraint(constraintName: string): TransformConstraintData;
    /** Finds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
     * than to call it multiple times.
     * @return May be null. */
    findPathConstraint(constraintName: string): PathConstraintData;
    findPathConstraintIndex(pathConstraintName: string): number;
}
