import { SkeletonData, AnimationStateData, BlendMode } from "@esotericsoftware/spine-core";
import { Texture2D, Material, Engine, BlendFactor, BlendOperation } from "@galacean/engine";
import { SpineAnimation } from "./SpineAnimation";

export class AnimationStateDataCache {
  private static _instance: AnimationStateDataCache;
  private _cache: Map<SkeletonData, AnimationStateData> = new Map();

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

  clear() {
    this._cache.clear();
  }
}

export class MaterialCache {
  private static _instance: MaterialCache;
  private _cache: Map<string, Material> = new Map();

  public static get instance(): MaterialCache {
    if (!this._instance) {
      this._instance = new MaterialCache();
    }
    return this._instance;
  }

  getMaterial(texture: Texture2D, engine: Engine, blendMode: BlendMode): Material {
    const key = `${texture.instanceId}_${blendMode}`;
    if (this._cache.has(key)) {
      return this._cache.get(key);
    } else {
      const newMaterial = this.createMaterialForTexture(texture, engine, blendMode);
      this._cache.set(key, newMaterial);
      return newMaterial;
    }
  }

  private createMaterialForTexture(texture: Texture2D, engine: Engine, blendMode: BlendMode): Material {
    const material = SpineAnimation.getDefaultMaterial(engine);
    material.shaderData.setTexture("material_SpineTexture", texture);
    this.setBlendMode(material, blendMode);
    return material;
  }

  private setBlendMode(material: Material, blendMode: BlendMode) {
    const target = material.renderState.blendState.targetBlendState;
    switch (blendMode) {
      case BlendMode.Additive:
        target.sourceColorBlendFactor = BlendFactor.SourceAlpha;
        target.destinationColorBlendFactor = BlendFactor.One;
        target.sourceAlphaBlendFactor = BlendFactor.One;
        target.destinationAlphaBlendFactor = BlendFactor.One;
        target.colorBlendOperation = target.alphaBlendOperation =
          BlendOperation.Add;
        break;
      case BlendMode.Multiply:
        target.sourceColorBlendFactor = BlendFactor.DestinationColor;
        target.destinationColorBlendFactor = BlendFactor.Zero;
        target.sourceAlphaBlendFactor = BlendFactor.One;
        target.destinationAlphaBlendFactor = BlendFactor.Zero;
        target.colorBlendOperation = target.alphaBlendOperation =
          BlendOperation.Add;
        break;
      case BlendMode.Screen:
        target.sourceColorBlendFactor = BlendFactor.One;
        target.destinationColorBlendFactor = BlendFactor.OneMinusSourceColor;
        target.sourceAlphaBlendFactor = BlendFactor.One;
        target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceColor;
        target.colorBlendOperation = target.alphaBlendOperation =
          BlendOperation.Add;
        break;
      default: // Normal 混合模式，还不支持的混合模式都走这个
        target.sourceColorBlendFactor = BlendFactor.SourceAlpha;
        target.destinationColorBlendFactor = BlendFactor.OneMinusSourceAlpha;
        target.sourceAlphaBlendFactor = BlendFactor.One;
        target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceAlpha;
        target.colorBlendOperation = target.alphaBlendOperation =
          BlendOperation.Add;
        break;
    }
  }

  clear() {
    this._cache.forEach(material => material.destroy());
    this._cache.clear();
  }
}



