import { VertexAttachment, Attachment } from "./Attachment";
import { Color } from "../Utils";
/** An attachment whose vertices make up a composite Bezier curve.
 *
 * See {@link PathConstraint} and [Paths](http://esotericsoftware.com/spine-paths) in the Spine User Guide. */
export declare class PathAttachment extends VertexAttachment {
    /** The lengths along the path in the setup pose from the start of the path to the end of each Bezier curve. */
    lengths: Array<number>;
    /** If true, the start and end knots are connected. */
    closed: boolean;
    /** If true, additional calculations are performed to make calculating positions along the path more accurate. If false, fewer
     * calculations are performed but calculating positions along the path is less accurate. */
    constantSpeed: boolean;
    /** The color of the path as it was in Spine. Available only when nonessential data was exported. Paths are not usually
     * rendered at runtime. */
    color: Color;
    constructor(name: string);
    copy(): Attachment;
}
