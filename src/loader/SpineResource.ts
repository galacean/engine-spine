import { AnimationState, AnimationStateData, MeshAttachment, RegionAttachment, Skeleton, SkeletonData } from "@esotericsoftware/spine-core";
import { Engine, Entity, ReferResource, Texture2D } from "@galacean/engine";
import { SpineAnimationRenderer } from "../SpineAnimationRenderer";

/**
 * Represents a resource that manages Spine animation data, textures, and entity templates for the Galacean engine.
 * 
*/
export class SpineResource extends ReferResource {
  private _texturesInSpineAtlas: Texture2D[] = [];
  private _skeletonData: SkeletonData;
  private _animationStateData: AnimationStateData;

  private _template: Entity;

  constructor(engine: Engine, skeletonData: SkeletonData) {
    super(engine);
    this._skeletonData = skeletonData;
    this._animationStateData = new AnimationStateData(skeletonData);
    this._associationTextureInSkeletonData(skeletonData);
    this._createTemplate();
  }

  /**
   * The skeleton data associated with this Spine resource.
   * 
  */
  get skeletonData(): SkeletonData {
    return this._skeletonData;
  }

  /**
   * The animation state data associated with this Spine resource.
  */
  get animationStateData(): AnimationStateData {
    return this._animationStateData;
  }

  /**
   * Creates and returns a new instance of the spine entity template.
   * 
   * @returns A cloned instance of the spine entity template
  */
  instantiate(): Entity {
    return this._template.clone();
  }

  protected override _onDestroy(): void {
    super._onDestroy();
    const { _skeletonData } = this;
    this._clearAttachmentTextures(_skeletonData);
    this._skeletonData = null;
    this._animationStateData = null;
  }

  private _createTemplate(): void {
    const spineEntity = new Entity(this.engine, 'spine-template');
    const spineAnimationRenderer = spineEntity.addComponent(SpineAnimationRenderer);
    const skeleton = new Skeleton(this._skeletonData);
    const state = new AnimationState(this._animationStateData);
    spineAnimationRenderer.skeleton = skeleton;
    spineAnimationRenderer.state = state;
    // @ts-ignore
    spineEntity._markAsTemplate(this);
    this._template = spineEntity;
  }

  private _associationTextureInSkeletonData(skeletonData: SkeletonData): void {
    const { skins, slots } = skeletonData;
    const textures = this._texturesInSpineAtlas;

    for (let i = 0, n = skins.length; i < n; i++) {
      for (let j = 0, m = slots.length; j < m; j++) {
        const slot = slots[j];
        const attachment = skins[i].getAttachment(slot.index, slot.name);
        const texture = <Texture2D>(<RegionAttachment | MeshAttachment>attachment)?.region?.texture.texture;
        if (texture) {
          if (!textures.includes(texture)) {
            textures.push(texture);
            // @ts-ignore
            texture._associationSuperResource(this);
          }
        }
      }
    }
  }

  private _clearAttachmentTextures(skeletonData: SkeletonData) {
    const { skins, slots } = skeletonData;
    for (let i = 0, n = skins.length; i < n; i++) {
      for (let j = 0, m = slots.length; j < m; j++) {
        const slot = slots[j];
        const attachment = skins[i].getAttachment(slot.index, slot.name);
        const texture = (<RegionAttachment | MeshAttachment>attachment)?.region?.texture?.texture;
        if (texture) {
          texture._disassociationSuperResource(this);
          (<RegionAttachment | MeshAttachment>attachment).region.texture.texture = null;
        }
      }
    }
  }

}