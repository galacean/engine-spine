import { BoneData } from "./BoneData";
import { Color } from "./Utils";
import { BlendMode } from "./BlendMode";
/** Stores the setup pose for a {@link Slot}. */
export declare class SlotData {
    /** The index of the slot in {@link Skeleton#getSlots()}. */
    index: number;
    /** The name of the slot, which is unique across all slots in the skeleton. */
    name: string;
    /** The bone this slot belongs to. */
    boneData: BoneData;
    /** The color used to tint the slot's attachment. If {@link #getDarkColor()} is set, this is used as the light color for two
     * color tinting. */
    color: Color;
    /** The dark color used to tint the slot's attachment for two color tinting, or null if two color tinting is not used. The dark
     * color's alpha is not used. */
    darkColor: Color;
    /** The name of the attachment that is visible for this slot in the setup pose, or null if no attachment is visible. */
    attachmentName: string;
    /** The blend mode for drawing the slot's attachment. */
    blendMode: BlendMode;
    constructor(index: number, name: string, boneData: BoneData);
}
