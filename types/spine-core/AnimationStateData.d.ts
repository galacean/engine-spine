import { SkeletonData } from "./SkeletonData";
import { Animation } from "./Animation";
import { Map } from "./Utils";
/** Stores mix (crossfade) durations to be applied when {@link AnimationState} animations are changed. */
export declare class AnimationStateData {
    /** The SkeletonData to look up animations when they are specified by name. */
    skeletonData: SkeletonData;
    animationToMixTime: Map<number>;
    /** The mix duration to use when no mix duration has been defined between two animations. */
    defaultMix: number;
    constructor(skeletonData: SkeletonData);
    /** Sets a mix duration by animation name.
     *
     * See {@link #setMixWith()}. */
    setMix(fromName: string, toName: string, duration: number): void;
    /** Sets the mix duration when changing from the specified animation to the other.
     *
     * See {@link TrackEntry#mixDuration}. */
    setMixWith(from: Animation, to: Animation, duration: number): void;
    /** Returns the mix duration to use when changing from the specified animation to the other, or the {@link #defaultMix} if
    * no mix duration has been set. */
    getMix(from: Animation, to: Animation): number;
}
