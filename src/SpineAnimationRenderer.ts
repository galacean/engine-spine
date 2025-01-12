import { Skeleton, SkeletonData, AnimationState, Physics, TrackEntry, AnimationStateData } from "@esotericsoftware/spine-core";
import { SpineGenerator } from "./SpineGenerator";
import {
  Buffer,
  Renderer,
  Entity,
  ignoreClone,
  Material,
  Engine,
  BoundingBox,
  Primitive,
  SubPrimitive,
  deepClone,
  VertexElement,
  VertexElementFormat,
  BufferBindFlag,
  BufferUsage,
  VertexBufferBinding,
  IndexBufferBinding,
  IndexFormat,
} from "@galacean/engine";
import { SpineMaterial } from "./SpineMaterial";
import { SkeletonDataResource } from "./loader/SkeletonDataResource";
import { getBlendMode } from "./util/BlendMode";

/**
 * Spine animation renderer, capable of rendering spine animations and providing functions for animation and skeleton manipulation.
 */
export class SpineAnimationRenderer extends Renderer {
  private static _defaultMaterial: Material;
  private static _spineGenerator = new SpineGenerator();

  private static _positionVertexElement = new VertexElement('POSITION', 0, VertexElementFormat.Vector3, 0);
  private static _colorVertexElement = new VertexElement('COLOR_0', 12, VertexElementFormat.Vector4, 0);
  private static _uvVertexElement = new VertexElement('TEXCOORD_0', 28, VertexElementFormat.Vector2, 0);

  /** @internal */
  static _materialCache = new Map<string, Material>();
  /** @internal */
  static _animationDataCache = new Map<SkeletonData, AnimationStateData>();

  /** @internal */
  static _getDefaultMaterial(engine: Engine): Material {
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

  /** Render setting for spine rendering. */
  @deepClone
  setting: SpineRenderSetting = new SpineRenderSetting();
  /**
   * Default state for spine animation.
   * Contains the default animation name to be played, whether this animation should loop,
   * the default skin name, and the default scale of the skeleton.
   */
  @deepClone
  defaultState: DefaultState = new DefaultState();
  /** @internal */
  @ignoreClone
  _primitive: Primitive;
  /** @internal */
  @ignoreClone
  _subPrimitives: SubPrimitive[] = [];
  /** @internal */
  @ignoreClone
  _indexBuffer: Buffer;
  /** @internal */
  @ignoreClone
  _vertexBuffer: Buffer;
  /** @internal */
  @ignoreClone
  _vertices: Float32Array;
  /** @internal */
  @ignoreClone
  _indices: Uint16Array;
  /** @internal */
  @ignoreClone
  _needResizeBuffer = false;
  /** @internal */
  @ignoreClone
  _vertexCount = 0;
  /** @internal */
  @ignoreClone
  _resource: SkeletonDataResource;

  @ignoreClone
  private _skeleton: Skeleton;
  @ignoreClone
  private _state: AnimationState;

  /**
   * Spine resource of current spine animation.This property allows you to switch between different animations at runtime.
   */
  get resource(): SkeletonDataResource {
    return this._resource;
  }

  set resource(value: SkeletonDataResource) {
    if (!value) {
      this._state = null;
      this._skeleton = null;
      this._resource = null;
      return;
    }
    this._resource = value;
    // @ts-ignore
    this._addResourceReferCount(value, 1);
    const { skeletonData } = value;
    this._skeleton = new Skeleton(skeletonData);
    let animationData = SpineAnimationRenderer._animationDataCache.get(skeletonData);
    if (!animationData) {
      animationData = new AnimationStateData(skeletonData);
      SpineAnimationRenderer._animationDataCache.set(skeletonData, animationData);
    }
    this._state = new AnimationState(animationData);
    const maxCount = SpineAnimationRenderer._spineGenerator.getMaxVertexCount(skeletonData);
    this._createBuffer(maxCount);
    this._initializeDefaultState();
    this._dirtyUpdateFlag |= SpineAnimationUpdateFlags.InitialVolume;
    this._state.addListener({
      start: () => {
        this._onAnimationStart();
      },
      complete: (entry: TrackEntry) => {
        this._onAnimationComplete(entry);
      },
    })
  }

  /**
   * Provides access to `AnimationState` which controls animation playback on a skeleton. 
   * You can use its API to manage, blend, and transition between multiple simultaneous animations effectively.
   */
  get state(): AnimationState {
    return this._state;
  }

  /**
   * Provides access to `Skeleton`, which defines the structure of a Spine model.
   * Through its API, users can manipulate bone positions, rotations, scaling 
   * and change spine attachment to customize character appearances dynamically during runtime.
   */
  get skeleton(): Skeleton {
    return this._skeleton;
  }

  /**
   * @internal
   */
  constructor(entity: Entity) {
    super(entity);
    const primitive = new Primitive(this._engine);
    this._primitive = primitive;
    primitive.addVertexElement(SpineAnimationRenderer._positionVertexElement);
    primitive.addVertexElement(SpineAnimationRenderer._colorVertexElement);
    primitive.addVertexElement(SpineAnimationRenderer._uvVertexElement);
  }

  /**
   * Separate slot by slot name. This will add a new sub primitive, and new materials.
   */
  addSeparateSlot(slotName: string): void {
    if (!this._skeleton) {
      console.error("Skeleton not found!");
    }
    const slot = this._skeleton.findSlot(slotName);
    if (slot) {
      SpineAnimationRenderer._spineGenerator.addSeparateSlot(slotName);
    } else {
      console.warn(`Slot: ${slotName} not find.`);
    }
  }

  /**
   * @internal
   */
  // @ts-ignore
  override _onEnable(): void {
    this._initializeDefaultState();
  }

  /**
   * @internal
   */
  override update(delta: number): void {
    const { _state, _skeleton } = this;
    if (_state && _skeleton) {
      _state.update(delta);
      _state.apply(_skeleton);
      _skeleton.update(delta);
      _skeleton.updateWorldTransform(Physics.update);
      SpineAnimationRenderer._spineGenerator.buildPrimitive(this._skeleton, this);
      if (this._isContainDirtyFlag(SpineAnimationUpdateFlags.InitialVolume)) {
        this._onWorldVolumeChanged();
        this._setDirtyFlagFalse(SpineAnimationUpdateFlags.InitialVolume);
      }
      if (this._isContainDirtyFlag(SpineAnimationUpdateFlags.AnimationVolume)) {
        this._calculateGeneratorBounds(this.bounds);
      }
    }
  }

  /**
   * @internal
   */
  // @ts-ignore
  override _render(context: any): void {
    const { _primitive, _subPrimitives } = this;
    const { _materials: materials, _engine: engine } = this;
    // @ts-ignore
    const renderElement = engine._renderElementPool.get();
    // @ts-ignore
    renderElement.set(this.priority, this._distanceForSort);
    // @ts-ignore
    const subRenderElementPool = engine._subRenderElementPool;
    if (!_subPrimitives) return;
    for (let i = 0, n = _subPrimitives.length; i < n; i++) {
      let material = materials[i];
      if (!material) {
        continue;
      }
      if (material.destroyed || material.shader.destroyed) {
        // @ts-ignore
        material = this.engine._meshMagentaMaterial;
      }

      const subRenderElement = subRenderElementPool.get();
      subRenderElement.set(this, material, _primitive, _subPrimitives[i]);
      renderElement.addSubRenderElement(subRenderElement);
    }
    // @ts-ignore
    context.camera._renderPipeline.pushRenderElement(context, renderElement);
  }

  /**
   * @internal
   */
  // @ts-ignore
  override _updateBounds(worldBounds: BoundingBox): void {
    this._calculateGeneratorBounds(worldBounds);
  }

  /**
   * @internal
   */
  _calculateGeneratorBounds(worldBounds: BoundingBox): void {
    const { bounds } = SpineGenerator;
    BoundingBox.transform(
      bounds,
      this.entity.transform.worldMatrix,
      worldBounds,
    );
  }

  /**
   * @internal
   */
  // @ts-ignore
  override _cloneTo(target: SpineAnimationRenderer): void {
    target.resource = this._resource;
  }

  /**
   * @internal
   */
  override _onDestroy(): void {
    const { _primitive, _subPrimitives, _resource } = this;
    _subPrimitives.length = 0;
    if (_primitive) {
      _primitive.destroy();
    }
    if (_resource) {
      this._addResourceReferCount(_resource, -1);
    }
    this._clearMaterialCache();
    this._primitive = null;
    this._resource = null;
    this._skeleton = null;
    this._state = null;
    this.setting = null;
    super._onDestroy();
  }

  /**
   * @internal
   */
  _createBuffer(vertexCount: number): void {
    const { _engine, _primitive } = this;
    this._vertices = new Float32Array(vertexCount * SpineGenerator.VERTEX_STRIDE);
    this._indices = new Uint16Array(vertexCount);
    const vertexStride = (SpineGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
    const vertexBuffer = new Buffer(
      _engine,
      BufferBindFlag.VertexBuffer,
      this._vertices,
      BufferUsage.Dynamic,
    );
    const indexBuffer = new Buffer(
      _engine,
      BufferBindFlag.IndexBuffer,
      this._indices,
      BufferUsage.Dynamic,
    );
    this._indexBuffer = indexBuffer;
    this._vertexBuffer = vertexBuffer;
    const vertexBufferBinding = new VertexBufferBinding(vertexBuffer, vertexStride);
    this._primitive.setVertexBufferBinding(0, vertexBufferBinding);
    const indexBufferBinding = new IndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    _primitive.setIndexBufferBinding(indexBufferBinding);
  }

  /**
   * @internal
   */
  _addSubPrimitive(subPrimitive: SubPrimitive): void {
    this._subPrimitives.push(subPrimitive);
  }

  /**
   * @internal
   */
  _clearSubPrimitives(): void {
    this._subPrimitives.length = 0;
  }

  /**
   * @internal
   */
  _isContainDirtyFlag(type: number): boolean {
    return (this._dirtyUpdateFlag & type) != 0;
  }

  /**
   * @internal
   */
  _setDirtyFlagFalse(type: number): void {
    this._dirtyUpdateFlag &= ~type;
  }

  /**
   * @internal
   */
  _onWorldVolumeChanged(): void {
    this._dirtyUpdateFlag |= RendererUpdateFlags.WorldVolume;
  }

  private _onAnimationStart(): void {
    this._dirtyUpdateFlag |= SpineAnimationUpdateFlags.AnimationVolume;
  }

  private _onAnimationComplete(entry: TrackEntry): void {
    if (!entry.loop) {
      this._setDirtyFlagFalse(SpineAnimationUpdateFlags.AnimationVolume)
    }
  }

  private _clearMaterialCache(): void {
    this._materials.forEach((item) => {
      const texture = item.shaderData.getTexture('material_SpineTexture');
      const blendMode = getBlendMode(item);
      const key = `${texture.instanceId}_${blendMode}`;
      SpineAnimationRenderer._materialCache.delete(key);
    });
  }

  private _initializeDefaultState(): void {
    const { skeleton, state } = this;
    if (skeleton && state) {
      const { animationName, skinName, loop, scale } = this.defaultState;
      skeleton.scaleX = scale;
      skeleton.scaleY = scale;
      if (skinName !== 'default') {
        skeleton.setSkinByName(skinName);
        skeleton.setToSetupPose();
      }
      if (animationName) {
        state.setAnimation(0, animationName, loop);
      }
    }
  }

}


/**
 * @internal
 */
export enum SpineAnimationUpdateFlags {
  /** On World Transform Changed */
  TransformVolume = 0x1,
  /** On Animation start play */
  AnimationVolume = 0x2,
  /** On skeleton data asset changed */
  InitialVolume = 0x4,
}

/**
 * @internal
 */
export enum RendererUpdateFlags {
  /** Include world position and world bounds. */
  WorldVolume = 0x1
}

/**
 * Render setting for spine rendering.
 */
export class SpineRenderSetting {
  /**
   * Creates an instance of SpineRenderSetting.
   */
  constructor(
    /**
     * The spacing between z layers @defaultValue `0.01`
     */
    public zSpacing: number = 0.01,
    
    /**
     * Whether to use clipping @defaultValue `true`
     */
    public useClipping: boolean = true,
  ) {}
}

/**
 * Default state for spine animation.
 * Contains the default animation name to be played, whether this animation should loop,
 * the default skin name, and the default scale of the skeleton.
 */
export class DefaultState {
  /**
   * Creates an instance of DefaultState
   */
  constructor(
    /**
     * The default scale of the animation @defaultValue `1`
     */
    public scale: number = 1,

    /**
     * Whether the default animation should loop @defaultValue `true. The default animation should loop`
     */
    public loop: boolean = true,

    /**
     * The name of the default animation @defaultValue `null. Do not play any animation by default`
     */
    public animationName: string | null = null,

    /**
     * The name of the default skin @defaultValue `default`
     */
    public skinName: string = "default"
  ) {}
}
