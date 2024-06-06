import { Skeleton, SkeletonData, Vector2 } from "@esotericsoftware/spine-core";
import { MeshGenerator } from "./core/MeshGenerator";
import { SpineRenderSetting } from "./types";
import {
  Script,
  Entity,
  ignoreClone,
  MeshRenderer,
  Texture2D,
  Material,
  Engine,
  BoundingBox,
} from "@galacean/engine";
import { SpineMaterial } from "./SpineMaterial";

export class SpineRenderer extends Script {
  private static _defaultMaterial: Material;
  static getDefaultMaterial(engine: Engine): Material {
    let defaultMaterial = this._defaultMaterial;
    if (defaultMaterial) {
      if (defaultMaterial.engine === engine) {
        return defaultMaterial.clone();
      } else {
        defaultMaterial.destroy(true);
        defaultMaterial = null;
      }
    }
    defaultMaterial = new SpineMaterial(engine);
    defaultMaterial.isGCIgnored = true;
    this._defaultMaterial = defaultMaterial;
    return defaultMaterial.clone();
  }

  @ignoreClone
  private _skeletonData: SkeletonData;
  @ignoreClone
  protected _skeleton: Skeleton;
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

  autoUpdateBounds: boolean = false;

  get skeleton() {
    return this._skeleton;
  }

  constructor(entity: Entity) {
    super(entity);
    this._meshGenerator = new MeshGenerator(this.engine, entity);
  }

  initialize(skeletonData: SkeletonData, setting?: SpineRenderSetting) {
    this.setting = setting;
    this._skeletonData = skeletonData;
    this._skeleton = new Skeleton(skeletonData);
    this._meshGenerator.initialize(this._skeletonData, this.setting);
  }

  /**
   * Separate slot by slot name. This will add a new sub mesh, and new materials.
   */
  addSeparateSlot(slotName: string) {
    if (!this._skeleton) {
      console.error("Skeleton not found!");
    }
    const meshRenderer = this.entity.getComponent(MeshRenderer);
    if (!meshRenderer) {
      console.warn("You need add MeshRenderer component to entity first");
    }
    const slot = this._skeleton.findSlot(slotName);
    if (slot) {
      this._meshGenerator.addSeparateSlot(slotName);
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
      console.warn("You need add separate slot");
      return;
    }
    if (separateSlots.includes(slotName)) {
      this._meshGenerator.addSeparateSlotTexture(slotName, texture);
    } else {
      console.warn(
        `Slot ${slotName} is not separated. You should use addSeparateSlot to separate it`
      );
    }
  }

  onLateUpdate() {
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
    const minX = offset.x;
    const maxX = offset.x + size.x;
    const minY = offset.y;
    const maxY = offset.y + size.y;
    const minZ = 0;
    const maxZ = drawOrder.length * zSpacing;
    bounds.min.set(minX, minY, minZ);
    bounds.max.set(maxX, maxY, maxZ);
    BoundingBox.transform(bounds, this.entity.transform.worldMatrix, bounds);
  }

  /**
   * Spine animation custom clone.
   */
  _cloneTo(target: SpineRenderer) {
    target.initialize(this._skeletonData);
    const _cloneSetting = { ...this.setting };
    target.setting = _cloneSetting;
  }

  private _disposeCurrentSkeleton() {
    this._skeletonData = null;
    this._skeleton = null;
  }

  onDestroy() {
    this._disposeCurrentSkeleton();
    this._meshGenerator = null;
    this.setting = null;
  }
}
