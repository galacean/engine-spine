import { AnimationState, AnimationStateData, Skeleton, SkeletonData } from "@esotericsoftware/spine-core";
import { Engine, Entity, ReferResource, Texture2D } from "@galacean/engine";
import { SpineAnimationRenderer } from "../SpineAnimationRenderer";

/**
 * Represents a resource that manages Spine animation data, textures, and entity templates for the Galacean engine.
 * 
 * `SpineResource` handles the setup and lifecycle of resources needed for rendering Spine animations,
 * including the association of textures and skeleton data, creation of a reusable entity template,
 * and cleanup of resources upon destruction. It provides methods to instantiate new entities from 
 * the template, ensuring consistent use of skeleton and animation data across instances.
 * 
*/
export class SpineResource extends ReferResource {
  private _texturesInSpineAtlas: Texture2D[] = [];
  private _skeletonData: SkeletonData;
  private _animationData: AnimationStateData;

  private _template: Entity;

  constructor(engine: Engine, skeletonData: SkeletonData) {
    super(engine);
    this._skeletonData = skeletonData;
    this._animationData = new AnimationStateData(skeletonData);
    this._associationTextureInSkeletonData(skeletonData);
    this._createTemplate();
  }

  /**
   * Gets the skeleton data associated with this Spine resource.
   * 
   * This getter provides access to the `SkeletonData` used in constructing
   * the skeleton entity template. It contains the static configuration for
   * bones, slots, skins, events, and animations. External components or systems 
   * can use this data to access and manipulate the structure and animations of the skeleton.
   * 
   * @returns {SkeletonData} The skeleton data for this resource.
  */
  get skeletonData(): SkeletonData {
    return this._skeletonData;
  }

  /**
   * Gets the animation state data associated with this Spine resource.
   * 
   * This property provides access to `AnimationStateData`, which stores settings
   * like default mix durations between animations. External systems can use this
   * data to configure or adjust animation blending for instances created from this template.
   * 
   * @returns {AnimationStateData} The animation state data of this resource.
  */
  get animationData(): AnimationStateData {
    return this._animationData;
  }

  /**
   * Creates and returns a new instance of the spine entity template.
   * 
   * This method clones the `_template` entity, which includes the skeleton and animation state 
   * configured with the associated `SpineAnimationRenderer` component, and returns a new instance 
   * with the same setup. The cloned instance shares references to the original skeleton data, 
   * animation state data, and textures, ensuring consistent resources across multiple entities.
   * 
   * @returns {Entity} A cloned instance of the spine entity template.
  */
  instantiate(): Entity {
    return this._template.clone();
  }

  protected override _onDestroy(): void {
    super._onDestroy();
    const { _texturesInSpineAtlas, _skeletonData } = this;
    _texturesInSpineAtlas && this._disassociationSuperResource(_texturesInSpineAtlas);
    this._clearAttachmentTextures(_skeletonData);
    this._skeletonData = null;
    this._animationData = null;
  }

  private _createTemplate(): void {
    const spineEntity = new Entity(this.engine, 'spine-template');
    const spineAnimationRenderer = spineEntity.addComponent(SpineAnimationRenderer);
    const skeleton = new Skeleton(this._skeletonData);
    const state = new AnimationState(this._animationData);
    spineAnimationRenderer.skeleton = skeleton;
    spineAnimationRenderer.state = state;
    // @ts-ignore
    spineEntity._markAsTemplate(this);
    this._template = spineEntity;
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