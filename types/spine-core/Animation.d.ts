import { Skeleton } from "./Skeleton";
import { ArrayLike } from "./Utils";
import { Slot } from "./Slot";
import { VertexAttachment } from "./attachments/Attachment";
import { Event } from "./Event";
/** A simple container for a list of timelines and a name. */
export declare class Animation {
    /** The animation's name, which is unique across all animations in the skeleton. */
    name: string;
    timelines: Array<Timeline>;
    timelineIds: Array<boolean>;
    /** The duration of the animation in seconds, which is the highest time of all keys in the timeline. */
    duration: number;
    constructor(name: string, timelines: Array<Timeline>, duration: number);
    hasTimeline(id: number): boolean;
    /** Applies all the animation's timelines to the specified skeleton.
     *
     * See Timeline {@link Timeline#apply(Skeleton, float, float, Array, float, MixBlend, MixDirection)}.
     * @param loop If true, the animation repeats after {@link #getDuration()}.
     * @param events May be null to ignore fired events. */
    apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    /** @param target After the first and before the last value.
     * @returns index of first value greater than the target. */
    static binarySearch(values: ArrayLike<number>, target: number, step?: number): number;
    static linearSearch(values: ArrayLike<number>, target: number, step: number): number;
}
/** The interface for all timelines. */
export interface Timeline {
    /** Applies this timeline to the skeleton.
     * @param skeleton The skeleton the timeline is being applied to. This provides access to the bones, slots, and other
     *           skeleton components the timeline may change.
     * @param lastTime The time this timeline was last applied. Timelines such as {@link EventTimeline}} trigger only at specific
     *           times rather than every frame. In that case, the timeline triggers everything between `lastTime`
     *           (exclusive) and `time` (inclusive).
     * @param time The time within the animation. Most timelines find the key before and the key after this time so they can
     *           interpolate between the keys.
     * @param events If any events are fired, they are added to this list. Can be null to ignore fired events or if the timeline
     *           does not fire events.
     * @param alpha 0 applies the current or setup value (depending on `blend`). 1 applies the timeline value.
     *           Between 0 and 1 applies a value between the current or setup value and the timeline value. By adjusting
     *           `alpha` over time, an animation can be mixed in or out. `alpha` can also be useful to
     *           apply animations on top of each other (layering).
     * @param blend Controls how mixing is applied when `alpha` < 1.
     * @param direction Indicates whether the timeline is mixing in or out. Used by timelines which perform instant transitions,
     *           such as {@link DrawOrderTimeline} or {@link AttachmentTimeline}. */
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    /** Uniquely encodes both the type of this timeline and the skeleton property that it affects. */
    getPropertyId(): number;
}
/** Controls how a timeline value is mixed with the setup pose value or current pose value when a timeline's `alpha`
 * < 1.
 *
 * See Timeline {@link Timeline#apply(Skeleton, float, float, Array, float, MixBlend, MixDirection)}. */
export declare enum MixBlend {
    /** Transitions from the setup value to the timeline value (the current value is not used). Before the first key, the setup
     * value is set. */
    setup = 0,
    /** Transitions from the current value to the timeline value. Before the first key, transitions from the current value to
     * the setup value. Timelines which perform instant transitions, such as {@link DrawOrderTimeline} or
     * {@link AttachmentTimeline}, use the setup value before the first key.
     *
     * `first` is intended for the first animations applied, not for animations layered on top of those. */
    first = 1,
    /** Transitions from the current value to the timeline value. No change is made before the first key (the current value is
     * kept until the first key).
     *
     * `replace` is intended for animations layered on top of others, not for the first animations applied. */
    replace = 2,
    /** Transitions from the current value to the current value plus the timeline value. No change is made before the first key
     * (the current value is kept until the first key).
     *
     * `add` is intended for animations layered on top of others, not for the first animations applied. Properties
     * keyed by additive animations must be set manually or by another animation before applying the additive animations, else
     * the property values will increase continually. */
    add = 3
}
/** Indicates whether a timeline's `alpha` is mixing out over time toward 0 (the setup or current pose value) or
 * mixing in toward 1 (the timeline's value).
 *
 * See Timeline {@link Timeline#apply(Skeleton, float, float, Array, float, MixBlend, MixDirection)}. */
export declare enum MixDirection {
    mixIn = 0,
    mixOut = 1
}
export declare enum TimelineType {
    rotate = 0,
    translate = 1,
    scale = 2,
    shear = 3,
    attachment = 4,
    color = 5,
    deform = 6,
    event = 7,
    drawOrder = 8,
    ikConstraint = 9,
    transformConstraint = 10,
    pathConstraintPosition = 11,
    pathConstraintSpacing = 12,
    pathConstraintMix = 13,
    twoColor = 14
}
/** The base class for timelines that use interpolation between key frame values. */
export declare abstract class CurveTimeline implements Timeline {
    static LINEAR: number;
    static STEPPED: number;
    static BEZIER: number;
    static BEZIER_SIZE: number;
    private curves;
    abstract getPropertyId(): number;
    constructor(frameCount: number);
    /** The number of key frames for this timeline. */
    getFrameCount(): number;
    /** Sets the specified key frame to linear interpolation. */
    setLinear(frameIndex: number): void;
    /** Sets the specified key frame to stepped interpolation. */
    setStepped(frameIndex: number): void;
    /** Returns the interpolation type for the specified key frame.
     * @returns Linear is 0, stepped is 1, Bezier is 2. */
    getCurveType(frameIndex: number): number;
    /** Sets the specified key frame to Bezier interpolation. `cx1` and `cx2` are from 0 to 1,
     * representing the percent of time between the two key frames. `cy1` and `cy2` are the percent of the
     * difference between the key frame's values. */
    setCurve(frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
    /** Returns the interpolated percentage for the specified key frame and linear percentage. */
    getCurvePercent(frameIndex: number, percent: number): number;
    abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a bone's local {@link Bone#rotation}. */
export declare class RotateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATION: number;
    static ROTATION: number;
    /** The index of the bone in {@link Skeleton#bones} that will be changed. */
    boneIndex: number;
    /** The time in seconds and rotation in degrees for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and angle of the specified keyframe. */
    setFrame(frameIndex: number, time: number, degrees: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a bone's local {@link Bone#x} and {@link Bone#y}. */
export declare class TranslateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_X: number;
    static PREV_Y: number;
    static X: number;
    static Y: number;
    /** The index of the bone in {@link Skeleton#bones} that will be changed. */
    boneIndex: number;
    /** The time in seconds, x, and y values for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds, x, and y values for the specified key frame. */
    setFrame(frameIndex: number, time: number, x: number, y: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a bone's local {@link Bone#scaleX)} and {@link Bone#scaleY}. */
export declare class ScaleTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a bone's local {@link Bone#shearX} and {@link Bone#shearY}. */
export declare class ShearTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a slot's {@link Slot#color}. */
export declare class ColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    /** The index of the slot in {@link Skeleton#slots} that will be changed. */
    slotIndex: number;
    /** The time in seconds, red, green, blue, and alpha values for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds, red, green, blue, and alpha for the specified key frame. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a slot's {@link Slot#color} and {@link Slot#darkColor} for two color tinting. */
export declare class TwoColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static PREV_R2: number;
    static PREV_G2: number;
    static PREV_B2: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    static R2: number;
    static G2: number;
    static B2: number;
    /** The index of the slot in {@link Skeleton#slots()} that will be changed. The {@link Slot#darkColor()} must not be
     * null. */
    slotIndex: number;
    /** The time in seconds, red, green, blue, and alpha values of the color, red, green, blue of the dark color, for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds, light, and dark colors for the specified key frame. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number, r2: number, g2: number, b2: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a slot's {@link Slot#attachment}. */
export declare class AttachmentTimeline implements Timeline {
    /** The index of the slot in {@link Skeleton#slots} that will be changed. */
    slotIndex: number;
    /** The time in seconds for each key frame. */
    frames: ArrayLike<number>;
    /** The attachment name for each key frame. May contain null values to clear the attachment. */
    attachmentNames: Array<string>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** The number of key frames for this timeline. */
    getFrameCount(): number;
    /** Sets the time in seconds and the attachment name for the specified key frame. */
    setFrame(frameIndex: number, time: number, attachmentName: string): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    setAttachment(skeleton: Skeleton, slot: Slot, attachmentName: string): void;
}
/** Changes a slot's {@link Slot#deform} to deform a {@link VertexAttachment}. */
export declare class DeformTimeline extends CurveTimeline {
    /** The index of the slot in {@link Skeleton#getSlots()} that will be changed. */
    slotIndex: number;
    /** The attachment that will be deformed. */
    attachment: VertexAttachment;
    /** The time in seconds for each key frame. */
    frames: ArrayLike<number>;
    /** The vertices for each key frame. */
    frameVertices: Array<ArrayLike<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds and the vertices for the specified key frame.
     * @param vertices Vertex positions for an unweighted VertexAttachment, or deform offsets if it has weights. */
    setFrame(frameIndex: number, time: number, vertices: ArrayLike<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Fires an {@link Event} when specific animation times are reached. */
export declare class EventTimeline implements Timeline {
    /** The time in seconds for each key frame. */
    frames: ArrayLike<number>;
    /** The event for each key frame. */
    events: Array<Event>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** The number of key frames for this timeline. */
    getFrameCount(): number;
    /** Sets the time in seconds and the event for the specified key frame. */
    setFrame(frameIndex: number, event: Event): void;
    /** Fires events for frames > `lastTime` and <= `time`. */
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a skeleton's {@link Skeleton#drawOrder}. */
export declare class DrawOrderTimeline implements Timeline {
    /** The time in seconds for each key frame. */
    frames: ArrayLike<number>;
    /** The draw order for each key frame. See {@link #setFrame(int, float, int[])}. */
    drawOrders: Array<Array<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** The number of key frames for this timeline. */
    getFrameCount(): number;
    /** Sets the time in seconds and the draw order for the specified key frame.
     * @param drawOrder For each slot in {@link Skeleton#slots}, the index of the new draw order. May be null to use setup pose
     *           draw order. */
    setFrame(frameIndex: number, time: number, drawOrder: Array<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes an IK constraint's {@link IkConstraint#mix}, {@link IkConstraint#softness},
 * {@link IkConstraint#bendDirection}, {@link IkConstraint#stretch}, and {@link IkConstraint#compress}. */
export declare class IkConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_MIX: number;
    static PREV_SOFTNESS: number;
    static PREV_BEND_DIRECTION: number;
    static PREV_COMPRESS: number;
    static PREV_STRETCH: number;
    static MIX: number;
    static SOFTNESS: number;
    static BEND_DIRECTION: number;
    static COMPRESS: number;
    static STRETCH: number;
    /** The index of the IK constraint slot in {@link Skeleton#ikConstraints} that will be changed. */
    ikConstraintIndex: number;
    /** The time in seconds, mix, softness, bend direction, compress, and stretch for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds, mix, softness, bend direction, compress, and stretch for the specified key frame. */
    setFrame(frameIndex: number, time: number, mix: number, softness: number, bendDirection: number, compress: boolean, stretch: boolean): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a transform constraint's {@link TransformConstraint#rotateMix}, {@link TransformConstraint#translateMix},
 * {@link TransformConstraint#scaleMix}, and {@link TransformConstraint#shearMix}. */
export declare class TransformConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static PREV_SCALE: number;
    static PREV_SHEAR: number;
    static ROTATE: number;
    static TRANSLATE: number;
    static SCALE: number;
    static SHEAR: number;
    /** The index of the transform constraint slot in {@link Skeleton#transformConstraints} that will be changed. */
    transformConstraintIndex: number;
    /** The time in seconds, rotate mix, translate mix, scale mix, and shear mix for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** The time in seconds, rotate mix, translate mix, scale mix, and shear mix for the specified key frame. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number, scaleMix: number, shearMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a path constraint's {@link PathConstraint#position}. */
export declare class PathConstraintPositionTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_VALUE: number;
    static VALUE: number;
    /** The index of the path constraint slot in {@link Skeleton#pathConstraints} that will be changed. */
    pathConstraintIndex: number;
    /** The time in seconds and path constraint position for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time in seconds and path constraint position for the specified key frame. */
    setFrame(frameIndex: number, time: number, value: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a path constraint's {@link PathConstraint#spacing}. */
export declare class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
/** Changes a transform constraint's {@link PathConstraint#rotateMix} and
 * {@link TransformConstraint#translateMix}. */
export declare class PathConstraintMixTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static ROTATE: number;
    static TRANSLATE: number;
    /** The index of the path constraint slot in {@link Skeleton#getPathConstraints()} that will be changed. */
    pathConstraintIndex: number;
    /** The time in seconds, rotate mix, and translate mix for each key frame. */
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** The time in seconds, rotate mix, and translate mix for the specified key frame. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
