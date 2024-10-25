import { AnimationStateData, SkeletonData } from "@esotericsoftware/spine-core";
import { Engine, ReferResource, Texture2D } from "@galacean/engine";

export class SpineResource extends ReferResource {
  private _texturesInSpineAtlas: Texture2D[] = [];
  private _skeletonData: SkeletonData;
  private _animationData: AnimationStateData;

  get skeletonData(): SkeletonData {
    return this._skeletonData;
  }

  get animationData(): AnimationStateData {
    return this._animationData;
  }

  constructor(engine: Engine, skeletonData: SkeletonData) {
    super(engine);
    this._skeletonData = skeletonData;
    this._animationData = new AnimationStateData(skeletonData);
    this._associationTextureInSkeletonData(skeletonData);
  }

  protected override _onDestroy(): void {
    super._onDestroy();
    const { _texturesInSpineAtlas, _skeletonData } = this;
    _texturesInSpineAtlas && this._disassociationSuperResource(_texturesInSpineAtlas);
    this._clearAttachmentTextures(_skeletonData);
    this._skeletonData = null;
    this._animationData = null;
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
        if (texture && !this._texturesInSpineAtlas.find(item => item.instanceId === texture.instanceId)) {
          this._texturesInSpineAtlas.push(texture);
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