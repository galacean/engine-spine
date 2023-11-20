import { Script, Entity } from "@galacean/engine";
import { SpineAnimation } from "./SpineAnimation";

export class SpineRenderer extends Script {
  private _resource: Entity;
  private _animationName = "";
  private _loop = true;
  private _autoPlay = true;
  private _scale = 0.005;
  private _spineAnimation: SpineAnimation = null;
  private _animationNames: Array<string> = [];

  get resource() {
    return this._resource;
  }

  set resource(value: Entity | null) {
    const resource = this._resource;
    if (value) {
      if (resource !== value) {
        this._removeResource();
        this._resource = value.clone();
        this.entity.addChild(this._resource);
        this._spineAnimation = this._resource.getComponent(SpineAnimation);
        // 如果设置了自动播放，默认就播放第一个动画
        if (this._autoPlay) {
          const { animations } = this._spineAnimation.skeletonData;
          const { _animationNames } = this;
          _animationNames.length = 0;
          for (let i = 0, l = animations.length; i < l; ++i) {
            _animationNames.push(animations[i].name);
          }
          _animationNames.length > 0 &&
            this.play(_animationNames[0], this._loop);
        }
      }
    } else {
      this._removeResource();
    }
  }

  get animationName() {
    return this._animationName;
  }

  set animationName(name: string) {
    if (this._animationName != name) {
      this._animationName = name;
      this._autoPlay && this._spineAnimation && this.play(name, this._loop);
    }
  }

  get loop() {
    return this._loop;
  }

  set loop(value: boolean) {
    if (this._loop !== value) {
      if (this._resource && this._spineAnimation) {
        if (value) {
          this._autoPlay && this.play(this._animationName, value);
        } else {
          this.play(this._animationName, value);
        }
      }

      this._loop = value;
    }
  }

  get autoPlay() {
    return this._autoPlay;
  }

  set autoPlay(value: boolean) {
    if (this._autoPlay !== value) {
      if (value && this._resource && this._spineAnimation) {
        this._spineAnimation.state.setAnimation(
          0,
          this._animationName,
          this._loop
        );
      }
      this._autoPlay = value;
    }
  }

  get scale() {
    return this._scale;
  }

  set scale(value: number) {
    if (this._scale !== value) {
      this._scale = value;
      this._spineAnimation && (this._spineAnimation.scale = value);
    }
  }

  get spineAnimation() {
    return this._spineAnimation;
  }

  onDestroy() {
    this._resource.parent = null;
    this._resource.destroy();
    this._resource = null;
  }

  play(name: string = "", loop: boolean = true) {
    const { _animationNames } = this;
    if (_animationNames.length > 0) {
      if (_animationNames.indexOf(name) !== -1) {
        this._animationName = name;
        this._loop = loop;
        if (this._resource && this._spineAnimation) {
          this._spineAnimation.state.setAnimation(0, name, loop);
        }
      }
    } else {
      this._animationName = name;
    }
  }

  private _removeResource() {
    if (this._resource && this._spineAnimation) {
      this.entity.removeChild(this._resource);
      this._resource.destroy();
      this._resource = null;
      this._spineAnimation = null;
      this._animationName = "";
    }
  }
}
