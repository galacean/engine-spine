import { MeshAttachment, RegionAttachment, TextureAtlasRegion } from "@esotericsoftware/spine-core";

export function createAttachmentFromRegion(
  region: TextureAtlasRegion,
  attachmentName: string,
  scale: number = 1,
  rotation: number = 0,
) {
  const attachment = new RegionAttachment(attachmentName, region.name);
  attachment.region = region;
  attachment.scaleX = 1;
  attachment.scaleY = 1;
  attachment.rotation = rotation;

  // pass OriginalWidth and OriginalHeight because UpdateOffset uses it in its calculation.
  const textureRegion = attachment.region;
  const atlasRegion = textureRegion as TextureAtlasRegion;
  const originalWidth = atlasRegion != null ? atlasRegion.originalWidth : textureRegion.width;
  const originalHeight = atlasRegion != null ? atlasRegion.originalHeight : textureRegion.height;
  attachment.width = originalWidth * scale;
  attachment.height = originalHeight * scale;

  attachment.updateRegion();
  return attachment;
}

export function CloneAttachmentWithRegion(
  attachment: RegionAttachment | MeshAttachment,
  atlasRegion: TextureAtlasRegion,
  cloneMeshAsLinked: boolean = true,
  useOriginalRegionSize: boolean = false,
  scale: number = 1,
) {
  if (attachment.constructor === RegionAttachment) {
    const newAttachment = (attachment.copy() as RegionAttachment);
    newAttachment.region = atlasRegion;
    if (!useOriginalRegionSize) {
      newAttachment.width = atlasRegion.width * scale;
      newAttachment.height = atlasRegion.height * scale;
    }
    newAttachment.updateRegion();
    return newAttachment;
  } else if (attachment.constructor === MeshAttachment) {
    const meshAttachment = attachment as MeshAttachment;
    const newAttachment = (cloneMeshAsLinked ? attachment.newLinkedMesh() : meshAttachment.copy()) as MeshAttachment;
    newAttachment.region = atlasRegion;
    newAttachment.updateRegion();
    return newAttachment;
  }
  return attachment.copy();
}