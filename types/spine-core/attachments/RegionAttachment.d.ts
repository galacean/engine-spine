import { Attachment } from "./Attachment";
import { Color, ArrayLike } from "../Utils";
import { TextureRegion } from "../Texture";
import { Bone } from "../Bone";
/** An attachment that displays a textured quadrilateral.
 *
 * See [Region attachments](http://esotericsoftware.com/spine-regions) in the Spine User Guide. */
export declare class RegionAttachment extends Attachment {
    static OX1: number;
    static OY1: number;
    static OX2: number;
    static OY2: number;
    static OX3: number;
    static OY3: number;
    static OX4: number;
    static OY4: number;
    static X1: number;
    static Y1: number;
    static C1R: number;
    static C1G: number;
    static C1B: number;
    static C1A: number;
    static U1: number;
    static V1: number;
    static X2: number;
    static Y2: number;
    static C2R: number;
    static C2G: number;
    static C2B: number;
    static C2A: number;
    static U2: number;
    static V2: number;
    static X3: number;
    static Y3: number;
    static C3R: number;
    static C3G: number;
    static C3B: number;
    static C3A: number;
    static U3: number;
    static V3: number;
    static X4: number;
    static Y4: number;
    static C4R: number;
    static C4G: number;
    static C4B: number;
    static C4A: number;
    static U4: number;
    static V4: number;
    /** The local x translation. */
    x: number;
    /** The local y translation. */
    y: number;
    /** The local scaleX. */
    scaleX: number;
    /** The local scaleY. */
    scaleY: number;
    /** The local rotation. */
    rotation: number;
    /** The width of the region attachment in Spine. */
    width: number;
    /** The height of the region attachment in Spine. */
    height: number;
    /** The color to tint the region attachment. */
    color: Color;
    /** The name of the texture region for this attachment. */
    path: string;
    rendererObject: any;
    region: TextureRegion;
    /** For each of the 4 vertices, a pair of <code>x,y</code> values that is the local position of the vertex.
     *
     * See {@link #updateOffset()}. */
    offset: ArrayLike<number>;
    uvs: ArrayLike<number>;
    tempColor: Color;
    constructor(name: string);
    /** Calculates the {@link #offset} using the region settings. Must be called after changing region settings. */
    updateOffset(): void;
    setRegion(region: TextureRegion): void;
    /** Transforms the attachment's four vertices to world coordinates.
     *
     * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
     * Runtimes Guide.
     * @param worldVertices The output world vertices. Must have a length >= `offset` + 8.
     * @param offset The `worldVertices` index to begin writing values.
     * @param stride The number of `worldVertices` entries between the value pairs written. */
    computeWorldVertices(bone: Bone, worldVertices: ArrayLike<number>, offset: number, stride: number): void;
    copy(): Attachment;
}
