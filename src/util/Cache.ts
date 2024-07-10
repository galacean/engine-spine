import { SkeletonData, AnimationStateData } from "@esotericsoftware/spine-core";
import { Material } from "@galacean/engine";

class Cache<K, V> {
  protected _cache: Map<K, V> = new Map();

  get(key: K): V {
    return this._cache.get(key);
  }

  set(key: K, value: V): void {
    this._cache.set(key, value);
  }

  clear(keys?: K[]): void {
    if (keys) {
      keys.forEach((key) => {
        this._cache.delete(key);
      });
    } else {
      this._cache.clear();
    }
  }
}

export class AnimationStateDataCache extends Cache<SkeletonData, AnimationStateData> {
  private static _instance: AnimationStateDataCache;

  public static get instance(): AnimationStateDataCache {
    if (!this._instance) {
      this._instance = new AnimationStateDataCache();
    }
    return this._instance;
  }

  getAnimationStateData(skeletonData: SkeletonData): AnimationStateData {
    if (this._cache.has(skeletonData)) {
      return this._cache.get(skeletonData);
    } else {
      const newAnimationStateData = new AnimationStateData(skeletonData);
      this._cache.set(skeletonData, newAnimationStateData);
      return newAnimationStateData;
    }
  }
}

export class MaterialCache extends Cache<string, Material> {
  private static _instance: MaterialCache;

  public static get instance(): MaterialCache {
    if (!this._instance) {
      this._instance = new MaterialCache();
    }
    return this._instance;
  }

  getMaterial(key: string): Material {
    return this.get(key);
  }
}
