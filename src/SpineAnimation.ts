import { Skeleton } from './spine-core/Skeleton';
import { SkeletonData } from './spine-core/SkeletonData';
import { AnimationState } from './spine-core/AnimationState';
import { AnimationStateData } from './spine-core/AnimationStateData';
import { MeshGenerator } from './core/MeshGenerator';
import {
  Script,
  Entity
} from 'oasis-engine';

export class SpineAnimation extends Script {
  private _skeletonData: SkeletonData;
  private _skeleton: Skeleton;
  private _state: AnimationState;
  protected _meshGenerator: MeshGenerator;

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

  setSkeletonData(skeletonData: SkeletonData) {
    this._skeletonData = skeletonData;
    this._skeleton = new Skeleton(skeletonData);
    const animationData = new AnimationStateData(skeletonData);
    this._state = new AnimationState(animationData);
    this._meshGenerator.buildMesh(this._skeleton);
  }

  disposeCurrentSkeleton() {
    this._skeletonData = null;
    // TODO
  }

  onUpdate(delta: number) {
    this.updateState(delta * 0.001);
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
    this._meshGenerator.buildMesh(this._skeleton);
    this._meshGenerator.fillVertexData();
    this._meshGenerator.fillIndexData();
  }
}