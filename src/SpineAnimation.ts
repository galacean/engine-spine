import { Skeleton } from './spine-core/Skeleton';
import { SkeletonData } from './spine-core/SkeletonData';
import { AnimationState } from './spine-core/AnimationState';
import { AnimationStateData } from './spine-core/AnimationStateData';
import { MeshGenerator } from './core/MeshGenerator';
import { SpineRenderSetting } from './types';
import { Vector2 } from './spine-core/Utils';
import {
  Script,
  Entity,
  ignoreClone,
  MeshRenderer,
  Texture2D,
} from '@galacean/engine';

export class SpineAnimation extends Script {
  @ignoreClone
  private _skeletonData: SkeletonData;
  @ignoreClone
  private _skeleton: Skeleton;
  @ignoreClone
  private _state: AnimationState;
  @ignoreClone
  private _tempOffset: Vector2 = new Vector2();
  @ignoreClone
  private _tempSize: Vector2 = new Vector2();
  @ignoreClone
  private _tempArray: Array<number> = [0, 0];
  @ignoreClone
  protected _meshGenerator: MeshGenerator;
  @ignoreClone
  setting: SpineRenderSetting;

  autoUpdate: boolean = true;
  autoUpdateBounds: boolean = false;

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
      // add sprite default material for new sub mesh
      const mtl1 = this.engine._spriteDefaultMaterial.clone();
      const mtl2 = this.engine._spriteDefaultMaterial.clone();
      const { materialCount } = meshRenderer;
      // one split will generate two sub mesh, thus two materials required
      // if no sub mesh generated, redundant material will ignored by renderer
      meshRenderer.setMaterial(materialCount, mtl1);
      meshRenderer.setMaterial(materialCount + 1, mtl2);
    } else {
      console.warn(`Slot: ${slotName} not find.`);
    }
  }

  /**
   * Change texture of a separated slot by name.
   */
  hackSeparateSlotTexture(slotName: string, texture: Texture2D) {
    this._meshGenerator.buildMesh(this._skeleton);
    const { separateSlots, subMeshItems } = this._meshGenerator;
    if (separateSlots.length === 0) {
      console.warn('You need add separate slot');
      return;
    }
    if (separateSlots.includes(slotName)) {
      const meshRenderer = this.entity.getComponent(MeshRenderer);
      const subMeshIndex = subMeshItems.findIndex(item => item.name === slotName);
      const mtl = meshRenderer.getMaterial(subMeshIndex);
      mtl.shaderData.setTexture('renderer_SpriteTexture', texture);
    } else {
      console.warn(`Slot ${slotName} is not separated. You should use addSeparateSlot to separate it`);
    }
  }

  onUpdate(delta: number) {
    if (this.autoUpdate) {
      this.updateState(delta);
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
    if (this.autoUpdateBounds) {
      this.updateBounds();
    }
  }

  updateBounds() {
    const meshRenderer = this.entity.getComponent(MeshRenderer);
    const bounds = meshRenderer.bounds;
    const offset = this._tempOffset;
    const size = this._tempSize;
    const temp = this._tempArray;
    const zSpacing = this.setting?.zSpacing || 0.01;
    const skeleton = this._skeleton;
    skeleton.getBounds(offset, size, temp);
    const drawOrder = skeleton.drawOrder;
    bounds.min.set(offset.x, offset.y, 0);
    bounds.max.set(offset.x + size.x, offset.y + size.y, drawOrder.length * zSpacing);
  }

  /**
   * Spine animation custom clone.
   */
  _cloneTo(target: SpineAnimation) {
    target.setSkeletonData(this.skeletonData);
    const _cloneSetting = {...this.setting};
    target.setting = _cloneSetting;
  }

  private _disposeCurrentSkeleton() {
    this._skeletonData = null;
    this._skeleton = null;
    this._state = null;
  }

  onDestroy() {
    this._disposeCurrentSkeleton();
    this._meshGenerator = null;
    this.setting = null;
  }

}