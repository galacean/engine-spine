import { TransformMode } from "./BoneData";
import { PositionMode, SpacingMode, RotateMode } from "./PathConstraintData";
import { BlendMode } from "./BlendMode";
import { AttachmentLoader } from "./attachments/AttachmentLoader";
import { SkeletonData } from "./SkeletonData";
import { CurveTimeline } from "./Animation";
/** Loads skeleton data in the Spine binary format.
 *
 * See [Spine binary format](http://esotericsoftware.com/spine-binary-format) and
 * [JSON and binary data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the Spine
 * Runtimes Guide. */
export declare class SkeletonBinary {
    static AttachmentTypeValues: number[];
    static TransformModeValues: TransformMode[];
    static PositionModeValues: PositionMode[];
    static SpacingModeValues: SpacingMode[];
    static RotateModeValues: RotateMode[];
    static BlendModeValues: BlendMode[];
    static BONE_ROTATE: number;
    static BONE_TRANSLATE: number;
    static BONE_SCALE: number;
    static BONE_SHEAR: number;
    static SLOT_ATTACHMENT: number;
    static SLOT_COLOR: number;
    static SLOT_TWO_COLOR: number;
    static PATH_POSITION: number;
    static PATH_SPACING: number;
    static PATH_MIX: number;
    static CURVE_LINEAR: number;
    static CURVE_STEPPED: number;
    static CURVE_BEZIER: number;
    /** Scales bone positions, image sizes, and translations as they are loaded. This allows different size images to be used at
     * runtime than were used in Spine.
     *
     * See [Scaling](http://esotericsoftware.com/spine-loading-skeleton-data#Scaling) in the Spine Runtimes Guide. */
    scale: number;
    attachmentLoader: AttachmentLoader;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(binary: Uint8Array): SkeletonData;
    private readSkin;
    private readAttachment;
    private readVertices;
    private readFloatArray;
    private readShortArray;
    private readAnimation;
    private readCurve;
    setCurve(timeline: CurveTimeline, frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
}
