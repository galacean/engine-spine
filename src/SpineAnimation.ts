import { Skeleton } from './spine-core/Skeleton';
import { SkeletonData } from './spine-core/SkeletonData';
import { AnimationState } from './spine-core/AnimationState';
import { AnimationStateData } from './spine-core/AnimationStateData';
import { MeshGenerator } from './core/MeshGenerator';
import { SpineRenderSetting } from './types';
import {
  Script,
  Entity,
  ignoreClone,
  MeshRenderer,
  Texture2D,
} from 'oasis-engine';

export class SpineAnimation extends Script {
  @ignoreClone
  private _skeletonData: SkeletonData;
  @ignoreClone
  private _skeleton: Skeleton;
  @ignoreClone
  private _state: AnimationState;
  @ignoreClone
  protected _meshGenerator: MeshGenerator;
  @ignoreClone
  setting: SpineRenderSetting;
  autoUpdate: boolean = true;

  get skeletonData() {
    return this._skeletonData;
  }

  get skeleton() {
    return this._skeleton;
  }

  get state() {
    return this._state;
  }

  get mesh() {
    return this._meshGenerator.mesh;
  }

  set scale(v: number) {
    if (this._skeleton) {
      this._skeleton.scaleX = v;
      this._skeleton.scaleY = v;
    }
  }

  constructor(entity: Entity) {
    super(entity);
    this._meshGenerator = new MeshGenerator(this.engine, entity);
  }

  setSkeletonData(skeletonData: SkeletonData, setting?: SpineRenderSetting) {
    if (!skeletonData) {
      console.error('SkeletonData is undefined');
    }
    this.setting = setting;
    this._skeletonData = skeletonData;
    this._skeleton = new Skeleton(skeletonData);
    const animationData = new AnimationStateData(skeletonData);
    this._state = new AnimationState(animationData);
    this._meshGenerator.initialize(skeletonData, this.setting);
  }

  /**
   * Separate slot by slot name. This will add a new sub mesh, and new materials.
   */
  addSeparateSlot(slotName: string) {
    if (!this.skeleton) {
      console.error('Skeleton not found!');
    }
    const meshRenderer = this.entity.getComponent(MeshRenderer);
    if (!meshRenderer) {
      console.warn('You need add MeshRenderer component to entity first');
    }
    const slot = this.skeleton.findSlot(slotName);
    if (slot) {
      this._meshGenerator.addSeparateSlot(slotName);
      const mtl = this.engine._spriteDefaultMaterial.clone();
      const { materialCount } = meshRenderer;
      // add default material for new sub mesh
      // split will generate two material
      meshRenderer.setMaterial(materialCount, mtl);
      meshRenderer.setMaterial(materialCount + 1, mtl);
    } else {
      console.warn(`Slot: ${slotName} not find.`);
    }
  }

  /**
   * Change texture of a separated slot by name.
   */
  hackSeparateSlotTexture(slotName: string, texture: Texture2D) {
    const { separateSlots } = this._meshGenerator;
    if (separateSlots.length === 0) {
      console.warn('You need add separate slot');
      return;
    }
    if (separateSlots.includes(slotName)) {
      const meshRenderer = this.entity.getComponent(MeshRenderer);
      const subMeshIndex = separateSlots.findIndex(item => item === slotName);
      const mtl = meshRenderer.getMaterial(subMeshIndex);
      mtl.shaderData.setTexture('u_spriteTexture', texture);
    } else {
      console.warn(`Slot ${slotName} is not separated. You should use addSeparateSlot to separate it`);
    }
  }

  disposeCurrentSkeleton() {
    this._skeletonData = null;
    // TODO
  }

  onUpdate(delta: number) {
    if (this.autoUpdate) {
      this.updateState(delta * 0.001);
    }
  }

  updateState(deltaTime: number) {
    if (!this._skeleton || !this.state) return;
    const state = this._state;
    const skeleton = this._skeleton;

    state.update(deltaTime);
    state.apply(skeleton);
    skeleton.updateWorldTransform();

    this.updateGeometry();
  }

  updateGeometry() {
    if (!this._skeleton) return;
    this._meshGenerator.buildMesh(this._skeleton);
  }

  /**
   * Spine animation custom clone.
   */
  _cloneTo(target: SpineAnimation) {
    target.setSkeletonData(this.skeletonData);
    const _cloneSetting = {...this.setting};
    target.setting = _cloneSetting;
  }
}