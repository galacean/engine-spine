import { VertexAttachment, Attachment } from "./Attachment";
import { TextureRegion } from "../Texture";
import { Color, ArrayLike } from "../Utils";
/** An attachment that displays a textured mesh. A mesh has hull vertices and internal vertices within the hull. Holes are not
 * supported. Each vertex has UVs (texture coordinates) and triangles are used to map an image on to the mesh.
 *
 * See [Mesh attachments](http://esotericsoftware.com/spine-meshes) in the Spine User Guide. */
export declare class MeshAttachment extends VertexAttachment {
    region: TextureRegion;
    /** The name of the texture region for this attachment. */
    path: string;
    /** The UV pair for each vertex, normalized within the texture region. */
    regionUVs: ArrayLike<number>;
    /** The UV pair for each vertex, normalized within the entire texture.
     *
     * See {@link #updateUVs}. */
    uvs: ArrayLike<number>;
    /** Triplets of vertex indices which describe the mesh's triangulation. */
    triangles: Array<number>;
    /** The color to tint the mesh. */
    color: Color;
    /** The width of the mesh's image. Available only when nonessential data was exported. */
    width: number;
    /** The height of the mesh's image. Available only when nonessential data was exported. */
    height: number;
    /** The number of entries at the beginning of {@link #vertices} that make up the mesh hull. */
    hullLength: number;
    /** Vertex index pairs describing edges for controling triangulation. Mesh triangles will never cross edges. Only available if
     * nonessential data was exported. Triangulation is not performed at runtime. */
    edges: Array<number>;
    private parentMesh;
    tempColor: Color;
    constructor(name: string);
    /** Calculates {@link #uvs} using {@link #regionUVs} and the {@link #region}. Must be called after changing the region UVs or
     * region. */
    updateUVs(): void;
    /** The parent mesh if this is a linked mesh, else null. A linked mesh shares the {@link #bones}, {@link #vertices},
     * {@link #regionUVs}, {@link #triangles}, {@link #hullLength}, {@link #edges}, {@link #width}, and {@link #height} with the
     * parent mesh, but may have a different {@link #name} or {@link #path} (and therefore a different texture). */
    getParentMesh(): MeshAttachment;
    /** @param parentMesh May be null. */
    setParentMesh(parentMesh: MeshAttachment): void;
    copy(): Attachment;
    /** Returns a new mesh with the {@link #parentMesh} set to this mesh's parent mesh, if any, else to this mesh. **/
    newLinkedMesh(): MeshAttachment;
}
