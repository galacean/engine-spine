import { Attachment, MeshAttachment, RegionAttachment, TextureAtlasRegion } from "@esotericsoftware/spine-core";

/**
 * Creates a new `RegionAttachment` from a specified texture atlas region.
 * 
 * @param region - The texture atlas region used to create the attachment.
 * @param attachmentName - The name of the new attachment.
 * @param scale - A scaling factor applied to the attachment's dimensions (default is 1).
 * @param rotation - The rotation angle of the attachment in degrees (default is 0).
 * @returns The created `RegionAttachment` with the passed in region.
 */
export function createAttachmentFromRegion(
  region: TextureAtlasRegion,
  attachmentName: string,
  scale: number = 1,
  rotation: number = 0,
): RegionAttachment {
  const attachment = new RegionAttachment(attachmentName, region.name);
  attachment.region = region;
  attachment.scaleX = 1;
  attachment.scaleY = 1;
  attachment.rotation = rotation;
  
  const originalWidth = region.originalWidth;
  const originalHeight = region.originalHeight;
  attachment.width = originalWidth * scale;
  attachment.height = originalHeight * scale;

  attachment.updateRegion();
  return attachment;
}

/**
 * Clones an attachment (`RegionAttachment` or `MeshAttachment`) and applies a new texture atlas region.
 * 
 * @param attachment - The attachment to clone (either `RegionAttachment` or `MeshAttachment`).
 * @param atlasRegion - The new texture atlas region to associate with the cloned attachment.
 * @param useOriginalRegionSize - Whether to retain the original region's size for the cloned attachment (default is `false`).
 * @param scale - A scaling factor applied to the dimensions of the cloned attachment (default is 1).
 * @param cloneMeshAsLinked - If `true`, clones a `MeshAttachment` as a linked mesh (default is `true`).
 * @returns The cloned attachment with the specified properties and the new texture region.
 */
export function cloneAttachmentWithRegion(
  attachment: RegionAttachment | MeshAttachment,
  atlasRegion: TextureAtlasRegion,
  useOriginalRegionSize: boolean = false,
  scale: number = 1,
  cloneMeshAsLinked: boolean = true,
): Attachment {
  let newAttachment: RegionAttachment | MeshAttachment;
  switch(attachment.constructor) {
    case RegionAttachment:
      newAttachment = (attachment.copy() as RegionAttachment);
      newAttachment.region = atlasRegion;
      if (!useOriginalRegionSize) {
        newAttachment.width = atlasRegion.width * scale;
        newAttachment.height = atlasRegion.height * scale;
      }
      newAttachment.updateRegion();
    break;

    case MeshAttachment:
      const meshAttachment = attachment as MeshAttachment;
      newAttachment = (cloneMeshAsLinked ? meshAttachment.newLinkedMesh() : meshAttachment.copy()) as MeshAttachment;
      newAttachment.region = atlasRegion;
      newAttachment.updateRegion();
    break;
    default:
      return attachment.copy();
  }
  return newAttachment;
}