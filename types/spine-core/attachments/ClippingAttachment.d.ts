import { VertexAttachment, Attachment } from "./Attachment";
import { SlotData } from "../SlotData";
import { Color } from "../Utils";
/** An attachment with vertices that make up a polygon used for clipping the rendering of other attachments. */
export declare class ClippingAttachment extends VertexAttachment {
    /** Clipping is performed between the clipping polygon's slot and the end slot. Returns null if clipping is done until the end of
     * the skeleton's rendering. */
    endSlot: SlotData;
    /** The color of the clipping polygon as it was in Spine. Available only when nonessential data was exported. Clipping polygons
     * are not usually rendered at runtime. */
    color: Color;
    constructor(name: string);
    copy(): Attachment;
}
