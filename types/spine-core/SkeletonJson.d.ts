import { AttachmentLoader } from "./attachments/AttachmentLoader";
import { SkeletonData } from "./SkeletonData";
import { TransformMode } from "./BoneData";
import { PositionMode, SpacingMode, RotateMode } from "./PathConstraintData";
import { Skin } from "./Skin";
import { VertexAttachment, Attachment } from "./attachments/Attachment";
import { CurveTimeline } from "./Animation";
import { BlendMode } from "./BlendMode";
/** Loads skeleton data in the Spine JSON format.
 *
 * See [Spine JSON format](http://esotericsoftware.com/spine-json-format) and
 * [JSON and binary data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the Spine
 * Runtimes Guide. */
export declare class SkeletonJson {
    attachmentLoader: AttachmentLoader;
    /** Scales bone positions, image sizes, and translations as they are loaded. This allows different size images to be used at
     * runtime than were used in Spine.
     *
     * See [Scaling](http://esotericsoftware.com/spine-loading-skeleton-data#Scaling) in the Spine Runtimes Guide. */
    scale: number;
    private linkedMeshes;
    constructor(attachmentLoader: AttachmentLoader);
    readSkeletonData(json: string | any): SkeletonData;
    readAttachment(map: any, skin: Skin, slotIndex: number, name: string, skeletonData: SkeletonData): Attachment;
    readVertices(map: any, attachment: VertexAttachment, verticesLength: number): void;
    readAnimation(map: any, name: string, skeletonData: SkeletonData): void;
    readCurve(map: any, timeline: CurveTimeline, frameIndex: number): void;
    getValue(map: any, prop: string, defaultValue: any): any;
    static blendModeFromString(str: string): BlendMode;
    static positionModeFromString(str: string): PositionMode;
    static spacingModeFromString(str: string): SpacingMode;
    static rotateModeFromString(str: string): RotateMode;
    static transformModeFromString(str: string): TransformMode;
}
