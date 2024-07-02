import {
  BlendFactor,
  BlendOperation,
  Engine,
  Material,
  Texture2D,
} from "@galacean/engine";
import {
  Skeleton,
  SkeletonData,
  SkeletonClipping,
  RegionAttachment,
  MeshAttachment,
  ClippingAttachment,
  ArrayLike,
  Color,
  BlendMode,
} from "@esotericsoftware/spine-core";
import { SpinePrimitive, SubPrimitive } from "./SpinePrimitive";
import { SpineRenderSetting } from "../types";
import { AdaptiveTexture } from "../loader/LoaderUtils";
import { SpineAnimation } from "../SpineAnimation";


type subRenderItems = {
  subPrimitive: SubPrimitive;
  blendMode: BlendMode;
  texture: any;
  slotName?: string;
};

export class SpineGenerator {
  static QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
  static VERTEX_SIZE = 8; // 2 2 4 position without z, uv, color
  static VERTEX_STRIDE = 9; // 3 2 4 position with z, uv, color
  static tempColor: Color = new Color();
  static tempDark: Color = new Color();
  static tempBlendMode: BlendMode | null = null;
  static tempTexture: AdaptiveTexture | null = null;

  private _setting: SpineRenderSetting;
  private _engine: Engine;
  private _clipper: SkeletonClipping = new SkeletonClipping();
  private _spinePrimitive: SpinePrimitive = new SpinePrimitive();
  private _renderer: SpineAnimation;

  private _vertexCount: number;
  private _vertices: Float32Array;
  private _verticesWithZ: Float32Array;
  private _indices: Uint16Array;
  private _needResize: boolean = false;
  private _subRenderItems: subRenderItems[] = [];
  readonly separateSlots: string[] = [];
  readonly separateSlotTextureMap: Map<string, Texture2D> = new Map();


  get subRenderItems() {
    return this._subRenderItems;
  }

  constructor(engine: Engine, renderer: SpineAnimation) {
    this._engine = engine;
    this._renderer = renderer;
  }

  initialize(skeletonData: SkeletonData, setting?: SpineRenderSetting) {
    if (setting) {
      this._setting = setting;
    }
    // Prepare buffer by using all attachment data but clippingAttachment
    const {
      defaultSkin: { attachments },
    } = skeletonData;
    let vertexCount: number = 0;
    const QUAD_TRIANGLE_LENGTH = SpineGenerator.QUAD_TRIANGLES.length;
    for (let i = 0, n = attachments.length; i < n; i++) {
      const slotAttachment = attachments[i];
      for (let key in slotAttachment) {
        const attachment = slotAttachment[key];
        if (!attachment) {
          continue;
        } else if (attachment instanceof RegionAttachment) {
          vertexCount += QUAD_TRIANGLE_LENGTH;
        } else if (attachment instanceof MeshAttachment) {
          let mesh = attachment;
          vertexCount += mesh.triangles.length;
        } else continue;
      }
    }
    this._vertexCount = vertexCount;
    this._prepareBufferData(this._vertexCount);
    const { _spinePrimitive } = this;
    _spinePrimitive.initialize(this._engine, this._vertexCount);
    this._renderer._primitive = _spinePrimitive.primitive;
  }

  buildPrimitive(skeleton: Skeleton) {
    const { useClipping = true, zSpacing = 0.01 } = this._setting || {};

    let verticesLength = 0;
    let indicesLength = 0;

    const drawOrder = skeleton.drawOrder;
    const maxSlotCount = drawOrder.length;
    const { _clipper, _spinePrimitive } = this;
    const subRenderItems = this._subRenderItems;
    subRenderItems.length = 0;
    let vertices: ArrayLike<number> = this._vertices;
    let triangles: Array<number>;
    let uvs: ArrayLike<number>;
    // 记录当前
    let start = 0;
    let count = 0;
    let blend = BlendMode.Normal;
    let texture = null;
    SpineGenerator.tempBlendMode = null;
    SpineGenerator.tempTexture = null;
    for (let slotIndex = 0; slotIndex < maxSlotCount; ++slotIndex) {
      const slot = drawOrder[slotIndex];
      if (!slot.bone.active) {
        _clipper.clipEndWithSlot(slot);
        continue;
      }
      const attachment = slot.getAttachment();
      let attachmentColor: Color = null;
      const z = zSpacing * slotIndex;
      let numFloats = 0;
      const isClipping = _clipper.isClipping();
      let vertexSize = isClipping ? 2 : SpineGenerator.VERTEX_SIZE;
      if (attachment instanceof RegionAttachment) {
        let regionAttachment = <RegionAttachment>attachment;
        attachmentColor = regionAttachment.color;
        numFloats = vertexSize * 4;
        regionAttachment.computeWorldVertices(
          slot,
          vertices,
          0,
          vertexSize,
        );
        triangles = SpineGenerator.QUAD_TRIANGLES;
        uvs = regionAttachment.uvs;
        texture = regionAttachment.region.texture;
      } else if (attachment instanceof MeshAttachment) {
        let meshAttachment = <MeshAttachment>attachment;
        attachmentColor = meshAttachment.color;
        numFloats = (meshAttachment.worldVerticesLength >> 1) * vertexSize;
        if (numFloats > vertices.length) {
          vertices = this._vertices = new Float32Array(numFloats);
        }
        meshAttachment.computeWorldVertices(
          slot,
          0,
          meshAttachment.worldVerticesLength,
          vertices,
          0,
          vertexSize,
        );
        triangles = meshAttachment.triangles;
        uvs = meshAttachment.uvs;
        texture = meshAttachment.region.texture;
      } else if (attachment instanceof ClippingAttachment) {
        if (useClipping) {
          let clip = <ClippingAttachment>attachment;
          _clipper.clipStart(slot, clip);
          continue;
        }
      } else if (useClipping) {
        // attachment might be null or BoundingBoxAttachment
        _clipper.clipEndWithSlot(slot);
        continue;
      }

      if (texture != null) {
        let finalVertices: ArrayLike<number>;
        let finalVerticesLength: number;
        let finalIndices: ArrayLike<number>;
        let finalIndicesLength: number;

        let skeleton = slot.bone.skeleton;
        let skeletonColor = skeleton.color;
        let slotColor = slot.color;
        let alpha = skeletonColor.a * slotColor.a * attachmentColor.a;
        let color = SpineGenerator.tempColor;
        let dark = SpineGenerator.tempDark;
        color.set(
          skeletonColor.r * slotColor.r * attachmentColor.r,
          skeletonColor.g * slotColor.g * attachmentColor.g,
          skeletonColor.b * slotColor.b * attachmentColor.b,
          alpha
        );

        if (isClipping) {
          _clipper.clipTriangles(
            vertices,
            triangles,
            triangles.length,
            uvs,
            color,
            dark,
            false,
          );
          let clippedVertices = _clipper.clippedVertices;
          let clippedTriangles = _clipper.clippedTriangles;
          finalVertices = clippedVertices;
          finalVerticesLength = clippedVertices.length;
          finalIndices = clippedTriangles;
          finalIndicesLength = clippedTriangles.length;
        } else {
          let verts = vertices;
          const { r, g, b, a } = color;
          for (
            let v = 2, u = 0, n = numFloats;
            v < n;
            v += vertexSize, u += 2
          ) {
            verts[v] = r;
            verts[v + 1] = g;
            verts[v + 2] = b;
            verts[v + 3] = a;
            verts[v + 4] = uvs[u];
            verts[v + 5] = uvs[u + 1];
          }
          finalVertices = vertices;
          finalVerticesLength = numFloats;
          finalIndices = triangles;
          finalIndicesLength = triangles.length;
        }

        if (finalVerticesLength == 0 || finalIndicesLength == 0) {
					_clipper.clipEndWithSlot(slot);
					continue;
				}

        let indexStart = verticesLength / SpineGenerator.VERTEX_STRIDE;
        let verticesWithZ = this._verticesWithZ;
        let i = verticesLength;
        let j = 0;
        for (; j < finalVerticesLength; ) {
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = z;
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
          verticesWithZ[i++] = finalVertices[j++];
        }
        verticesLength = i;

        let indicesArray = this._indices;
        for (i = indicesLength, j = 0; j < finalIndicesLength; i++, j++) {
          indicesArray[i] = finalIndices[j] + indexStart;
        }
        indicesLength += finalIndicesLength;

        const slotData = slot.data;
        const slotName = slotData.name;
        blend = slotData.blendMode;
        const blendModeChanged =  SpineGenerator.tempBlendMode !== null &&
        SpineGenerator.tempBlendMode !== slotData.blendMode;
        const textureChanged = SpineGenerator.tempTexture !== null && 
        SpineGenerator.tempTexture !== texture;
        const slotNeedSeparate = this.separateSlots.includes(slotName);
        
        if (slotNeedSeparate || blendModeChanged || textureChanged) {
          // Finish accumulated count first
          if (count > 0) {
            const subPrimitive = new SubPrimitive();
            subPrimitive.start = start;
            subPrimitive.count = count;
            subRenderItems.push({
              subPrimitive,
              texture: SpineGenerator.tempTexture,
              blendMode: SpineGenerator.tempBlendMode,
            });
            start += count;
            count = 0;
          }
          if (slotNeedSeparate) {
            // If separatedTexture exist, set texture params
            const separateTexture = this.separateSlotTextureMap.get(slotName);
            if (separateTexture) {
              const oldTexture = texture.texture;
              separateTexture.filterMode = oldTexture.filterMode;
              separateTexture.wrapModeU = oldTexture.wrapModeU;
              separateTexture.wrapModeV = oldTexture.wrapModeV;
            }
            const subPrimitive = new SubPrimitive();
            subPrimitive.start = start;
            subPrimitive.count = finalIndicesLength;
            subRenderItems.push({
              blendMode: blend,
              subPrimitive,
              texture,
              slotName,
            });
            start += finalIndicesLength;
            count = 0;
          } else {
            count += finalIndicesLength;
          }
        } else {
          count += finalIndicesLength;
        }
        SpineGenerator.tempBlendMode = blend;
        SpineGenerator.tempTexture = texture;
      }

      _clipper.clipEndWithSlot(slot);
    } // slot traverse end

    // add reset sub primitive
    if (count > 0) {
      const subPrimitive = new SubPrimitive();
      subPrimitive.start = start;
      subPrimitive.count = count;
      subRenderItems.push({
        blendMode: blend,
        subPrimitive,
        texture,
      });
      count = 0;
    }

    _clipper.clipEnd();

    // sort sub primitive
    subRenderItems.sort((a, b) => a.subPrimitive.start - b.subPrimitive.start);

     // update buffer when vertex count change
     if (indicesLength > 0 && indicesLength !== this._vertexCount) {
      if (indicesLength > this._vertexCount) {
        this._vertexCount = indicesLength;
        this._prepareBufferData(this._vertexCount);
        this._needResize = true;
        return;
      }
    }

    // update sub primitive
    _spinePrimitive.clearSubPrimitive();
    const renderer = this._renderer;
    for (let i = 0, l = subRenderItems.length; i < l; ++i) {
      const item = subRenderItems[i];
      const { slotName, blendMode, texture } = item;
      _spinePrimitive.addSubPrimitive(item.subPrimitive);
      let material = renderer.getMaterial(i);
      if (!material) {
        material = SpineAnimation.getDefaultMaterial(this._engine);
      }
      let subTexture = texture.texture;
      if (this.separateSlotTextureMap.has(slotName)) {
        subTexture = this.separateSlotTextureMap.get(slotName);
      }
      material.shaderData.setTexture("material_SpineTexture", subTexture);
      this.setBlendMode(material, blendMode);
      renderer.setMaterial(i, material);
    }
    this._renderer._subPrimitives = _spinePrimitive.subPrimitive;

    if (this._needResize) {
      _spinePrimitive.changeBuffer(this._engine, this._vertexCount);
      this._needResize = false;
    }
    _spinePrimitive.vertexBuffer.setData(this._verticesWithZ);
    _spinePrimitive.indexBuffer.setData(this._indices);
  }

  addSeparateSlot(slotName: string) {
    this.separateSlots.push(slotName);
  }

  addSeparateSlotTexture(slotName: string, texture: Texture2D) {
    this.separateSlotTextureMap.set(slotName, texture);
  }

  private _prepareBufferData(vertexCount: number) {
    this._vertices = new Float32Array(vertexCount * SpineGenerator.VERTEX_SIZE);
    this._verticesWithZ = new Float32Array(
      vertexCount * SpineGenerator.VERTEX_STRIDE
    );
    this._indices = new Uint16Array(vertexCount);
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
}
