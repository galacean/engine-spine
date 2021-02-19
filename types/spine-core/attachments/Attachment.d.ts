import { Slot } from "../Slot";
import { ArrayLike } from "../Utils";
/** The base class for all attachments. */
export declare abstract class Attachment {
    name: string;
    constructor(name: string);
    abstract copy(): Attachment;
}
/** Base class for an attachment with vertices that are transformed by one or more bones and can be deformed by a slot's
 * {@link Slot#deform}. */
export declare abstract class VertexAttachment extends Attachment {
    private static nextID;
    /** The unique ID for this attachment. */
    id: number;
    /** The bones which affect the {@link #getVertices()}. The array entries are, for each vertex, the number of bones affecting
     * the vertex followed by that many bone indices, which is the index of the bone in {@link Skeleton#bones}. Will be null
     * if this attachment has no weights. */
    bones: Array<number>;
    /** The vertex positions in the bone's coordinate system. For a non-weighted attachment, the values are `x,y`
     * entries for each vertex. For a weighted attachment, the values are `x,y,weight` entries for each bone affecting
     * each vertex. */
    vertices: ArrayLike<number>;
    /** The maximum number of world vertex values that can be output by
     * {@link #computeWorldVertices()} using the `count` parameter. */
    worldVerticesLength: number;
    /** Deform keys for the deform attachment are also applied to this attachment. May be null if no deform keys should be applied. */
    deformAttachment: VertexAttachment;
    constructor(name: string);
    /** Transforms the attachment's local {@link vertices} to world coordinates. If the slot's {@link Slot#deform} is
     * not empty, it is used to deform the vertices.
     *
     * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
     * Runtimes Guide.
     * @param start The index of the first {@link #vertices} value to transform. Each vertex has 2 values, x and y.
     * @param count The number of world vertex values to output. Must be <= {@link #worldVerticesLength} - `start`.
     * @param worldVertices The output world vertices. Must have a length >= `offset` + `count` *
     *           `stride` / 2.
     * @param offset The `worldVertices` index to begin writing values.
     * @param stride The number of `worldVertices` entries between the value pairs written. */
    computeWorldVertices(slot: Slot, start: number, count: number, worldVertices: ArrayLike<number>, offset: number, stride: number): void;
    /** Does not copy id (generated) or name (set on construction). **/
    copyTo(attachment: VertexAttachment): void;
}
