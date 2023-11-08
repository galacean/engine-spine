import { Script, Entity } from '@galacean/engine';
import { SpineAnimation } from './SpineAnimation';

export class SpineComponent extends Script {
  private _autoPlay = false;
  private _scale = 0.005;
  private _animationName = '';
  private _resource: Entity;

  onStart() {
    const spineEntity = this._resource;
    if (!spineEntity) return;
    const spineAnimation = spineEntity.getComponent(SpineAnimation);
    spineAnimation.scale = this._scale;
    this.entity.addChild(spineEntity);
    if (this.autoPlay && this.animationName) {
      spineAnimation.state.setAnimation(0, this.animationName, true);
    }
  }

  get animationName() {
    return this._animationName;
  }

  set animationName(name: string) {
    this._animationName = name;
    const spineEntity = this._resource;
    if (!spineEntity) return;
    const spineAnimation = spineEntity.getComponent(SpineAnimation);
    spineAnimation.state.setAnimation(0, name, true);
  }

  get resource() {
    return this._resource;
  }

  set resource(r) {
    if (this._resource) {
      this._resource.parent = null;
    }
    this._resource = r;
    if (r) {
      this.onStart();
    }
  }

  get autoPlay() {
    return this._autoPlay;
  }

  set autoPlay(value) {
    this._autoPlay = value;
    const spineEntity = this._resource;
    if (!spineEntity) return;
    const spineAnimation = spineEntity.getComponent(SpineAnimation);
    if (value === false) {
      spineAnimation.state.setEmptyAnimation(0, 1);
    } else if (value === true) {
      spineAnimation.state.setAnimation(0, this.animationName, true);
    }
  }

  get scale() {
    return this._scale;
  }

  set scale(value: number) {
    this._scale = value;
    const spineEntity = this._resource;
    if (!spineEntity) return;
    const spineAnimation = spineEntity.getComponent(SpineAnimation);
    spineAnimation.scale = value;
  }

  onDestroy() {
    this._resource.parent = null;
    this._resource.destroy();
    this._resource = null;
  }
}