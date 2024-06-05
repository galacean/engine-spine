import { SkeletonData } from "./spine-core/SkeletonData";
import { AnimationState } from "./spine-core/AnimationState";
import { AnimationStateData } from "./spine-core/AnimationStateData";
import { Entity, ignoreClone } from "@galacean/engine";
import { SpineRenderer } from "./SpineRenderer";
export class SpineAnimation extends SpineRenderer {
  @ignoreClone
  private _state: AnimationState;

  get state() {
    return this._state;
  }

  constructor(entity: Entity) {
    super(entity);
  }

  initialize(skeletonData: SkeletonData) {
    super.initialize(skeletonData);
    const animationData = new AnimationStateData(skeletonData);
    this._state = new AnimationState(animationData);
  }

  onUpdate(delta: number) {
    if (!this._skeleton || !this.state) return;
    const state = this._state;
    const skeleton = this._skeleton;
    state.update(delta);
    state.apply(skeleton);
    skeleton.updateWorldTransform();
  }
}
