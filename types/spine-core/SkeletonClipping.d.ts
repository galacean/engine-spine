import { ClippingAttachment } from "./attachments/ClippingAttachment";
import { Slot } from "./Slot";
import { Color, ArrayLike } from "./Utils";
export declare class SkeletonClipping {
    private triangulator;
    private clippingPolygon;
    private clipOutput;
    clippedVertices: number[];
    clippedTriangles: number[];
    private scratch;
    private clipAttachment;
    private clippingPolygons;
    clipStart(slot: Slot, clip: ClippingAttachment): number;
    clipEndWithSlot(slot: Slot): void;
    clipEnd(): void;
    isClipping(): boolean;
    clipTriangles(vertices: ArrayLike<number>, verticesLength: number, triangles: ArrayLike<number>, trianglesLength: number, uvs: ArrayLike<number>, light: Color, dark: Color, twoColor: boolean): void;
    /** Clips the input triangle against the convex, clockwise clipping area. If the triangle lies entirely within the clipping
     * area, false is returned. The clipping area must duplicate the first vertex at the end of the vertices list. */
    clip(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, clippingArea: Array<number>, output: Array<number>): boolean;
    static makeClockwise(polygon: ArrayLike<number>): void;
}
