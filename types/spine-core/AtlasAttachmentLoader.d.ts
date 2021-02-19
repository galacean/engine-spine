import { AttachmentLoader } from "./attachments/AttachmentLoader";
import { TextureAtlas } from "./TextureAtlas";
import { Skin } from "./Skin";
import { RegionAttachment } from "./attachments/RegionAttachment";
import { MeshAttachment } from "./attachments/MeshAttachment";
import { BoundingBoxAttachment } from "./attachments/BoundingBoxAttachment";
import { PathAttachment } from "./attachments/PathAttachment";
import { PointAttachment } from "./attachments/PointAttachment";
import { ClippingAttachment } from "./attachments/ClippingAttachment";
/** An {@link AttachmentLoader} that configures attachments using texture regions from an {@link TextureAtlas}.
 *
 * See [Loading skeleton data](http://esotericsoftware.com/spine-loading-skeleton-data#JSON-and-binary-data) in the
 * Spine Runtimes Guide. */
export declare class AtlasAttachmentLoader implements AttachmentLoader {
    atlas: TextureAtlas;
    constructor(atlas: TextureAtlas);
    newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment;
    newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment;
    newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment;
    newPathAttachment(skin: Skin, name: string): PathAttachment;
    newPointAttachment(skin: Skin, name: string): PointAttachment;
    newClippingAttachment(skin: Skin, name: string): ClippingAttachment;
}
