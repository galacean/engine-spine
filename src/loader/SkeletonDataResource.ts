import { SkeletonData } from "@esotericsoftware/spine-core";
import { Engine, ReferResource, Texture2D } from "@galacean/engine";
import { SpineAnimationRenderer } from "../SpineAnimationRenderer";

export class SkeletonDataResource extends ReferResource {
  readonly textures: Texture2D[] = [];
  private _skeletonData: SkeletonData;

  get skeletonData() {
    return this._skeletonData;
  }

  constructor(engine: Engine, skeletonData: SkeletonData) {
    super(engine);
    this._skeletonData = skeletonData;
    this._associationTextureInSkeletonData(skeletonData);
  }

  protected override _onDestroy(): void {
    super._onDestroy();
    const { textures, _skeletonData } = this;
    textures && this._disassociationSuperResource(textures);
    this._clearAttachmentTextures(_skeletonData);
    SpineAnimationRenderer._animationDataCache.delete(_skeletonData);
    this._skeletonData = null;
  }

  private _disassociationSuperResource(resources: ReferResource[]): void {
    for (let i = 0, n = resources.length; i < n; i++) {
      // @ts-ignore
      resources[i]._disassociationSuperResource(this);
    }
  }

  private _associationTextureInSkeletonData(skeletonData: SkeletonData) {
    const { skins } = skeletonData;
    skins.forEach((skin) => {
      const { attachments } = skin;
      attachments.forEach((attachmentMap) => {
        const attachment = Object.values(attachmentMap)[0];
        // @ts-ignore
        const texture = attachment?.region?.texture.texture;
        if (texture && !this.textures.find(item => item.instanceId === texture.instanceId)) {
          this.textures.push(texture);
          texture._associationSuperResource(this);
        }
      });
    });
  }

  private _clearAttachmentTextures(skeletonData: SkeletonData) {
    const { skins } = skeletonData;
    skins.forEach((skin) => {
      const { attachments } = skin;
      attachments.forEach((attachmentMap) => {
        const attachment = Object.values(attachmentMap)[0];
        // @ts-ignore
        if (attachment?.region?.texture) {
          // @ts-ignore
          attachment.region.texture.texture = null;
        }
      });
    });
  }

}