import { BoundingBoxAttachment } from "./attachments/BoundingBoxAttachment";
import { Skeleton } from "./Skeleton";
/** Collects each visible {@link BoundingBoxAttachment} and computes the world vertices for its polygon. The polygon vertices are
 * provided along with convenience methods for doing hit detection. */
export declare class SkeletonBounds {
    /** The left edge of the axis aligned bounding box. */
    minX: number;
    /** The bottom edge of the axis aligned bounding box. */
    minY: number;
    /** The right edge of the axis aligned bounding box. */
    maxX: number;
    /** The top edge of the axis aligned bounding box. */
    maxY: number;
    /** The visible bounding boxes. */
    boundingBoxes: BoundingBoxAttachment[];
    /** The world vertices for the bounding box polygons. */
    polygons: ArrayLike<number>[];
    private polygonPool;
    /** Clears any previous polygons, finds all visible bounding box attachments, and computes the world vertices for each bounding
     * box's polygon.
     * @param updateAabb If true, the axis aligned bounding box containing all the polygons is computed. If false, the
     *           SkeletonBounds AABB methods will always return true. */
    update(skeleton: Skeleton, updateAabb: boolean): void;
    aabbCompute(): void;
    /** Returns true if the axis aligned bounding box contains the point. */
    aabbContainsPoint(x: number, y: number): boolean;
    /** Returns true if the axis aligned bounding box intersects the line segment. */
    aabbIntersectsSegment(x1: number, y1: number, x2: number, y2: number): boolean;
    /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
    aabbIntersectsSkeleton(bounds: SkeletonBounds): boolean;
    /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
     * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
    containsPoint(x: number, y: number): BoundingBoxAttachment;
    /** Returns true if the polygon contains the point. */
    containsPointPolygon(polygon: ArrayLike<number>, x: number, y: number): boolean;
    /** Returns the first bounding box attachment that contains any part of the line segment, or null. When doing many checks, it
     * is usually more efficient to only call this method if {@link #aabbIntersectsSegment()} returns
     * true. */
    intersectsSegment(x1: number, y1: number, x2: number, y2: number): BoundingBoxAttachment;
    /** Returns true if the polygon contains any part of the line segment. */
    intersectsSegmentPolygon(polygon: ArrayLike<number>, x1: number, y1: number, x2: number, y2: number): boolean;
    /** Returns the polygon for the specified bounding box, or null. */
    getPolygon(boundingBox: BoundingBoxAttachment): ArrayLike<number>;
    /** The width of the axis aligned bounding box. */
    getWidth(): number;
    /** The height of the axis aligned bounding box. */
    getHeight(): number;
}
