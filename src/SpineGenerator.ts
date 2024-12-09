import {
  ArrayLike,
  BlendMode,
  ClippingAttachment,
  Color,
  MeshAttachment,
  NumberArrayLike,
  RegionAttachment,
  Skeleton,
  SkeletonClipping,
} from "@esotericsoftware/spine-core";
import { Engine, Material, SubPrimitive, Texture2D } from "@galacean/engine";
import { SpineAnimationRenderer } from "./SpineAnimationRenderer";
import { AdaptiveTexture } from "./loader/LoaderUtils";
import { setBlendMode } from "./util/BlendMode";
import { ClearablePool } from "./util/ClearablePool";
import { ReturnablePool } from "./util/ReturnablePool";

class SubRenderItem {
  subPrimitive: SubPrimitive;
  blendMode: BlendMode;
  texture: any;
  slotName?: string;
}

export class SpineGenerator {
  static QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
  static VERTEX_SIZE = 8; // 2 2 4 position without z, uv, color
  static VERTEX_STRIDE = 9; // 3 2 4 position with z, uv, color
  static tempDark = new Color();
  static tempColor = new Color();
  static tempVerts = new Array(8);
  static tempBlendMode: BlendMode | null = null;
  static tempTexture: AdaptiveTexture | null = null;
  static subPrimitivePool = new ReturnablePool(SubPrimitive);
  static subRenderItemPool = new ClearablePool(SubRenderItem);

  private _clipper: SkeletonClipping = new SkeletonClipping();
  private _subRenderItems: SubRenderItem[] = [];
  private _separateSlots = new Map();
  private _separateSlotTextureMap: Map<string, Texture2D> = new Map();

  buildPrimitive(
    skeleton: Skeleton,
    renderer: SpineAnimationRenderer,
    shouldUpdateBounds: boolean
  ) {
    const {
      _clipper,
      _separateSlots,
      _subRenderItems,
      _separateSlotTextureMap,
    } = this;
    let verticesLength = 0;
    let indicesLength = 0;
    const drawOrder = skeleton.drawOrder;
    const maxSlotCount = drawOrder.length;
    const {
      engine,
      _indices,
      _vertices,
      _localBounds,
      _vertexCount,
      _subPrimitives,
      zSpacing,
      premultipliedAlpha,
      updateBoundsPerFrame,
    } = renderer;
    if (updateBoundsPerFrame) {
      _localBounds.min.set(Infinity, Infinity, Infinity);
      _localBounds.max.set(-Infinity, -Infinity, -Infinity);
    }
    let {
      tempVerts,
      tempTexture,
      tempBlendMode,
      subRenderItemPool,
      subPrimitivePool,
    } = SpineGenerator;
    _subRenderItems.length = 0;
    subRenderItemPool.clear();
    let vertices = renderer._vertices;
    let triangles: Array<number>;
    let uvs: NumberArrayLike;
    // 记录当前
    let start = 0;
    let count = 0;
    let blend = BlendMode.Normal;
    let texture = null;
    let primitiveIndex = 0;
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

      if (!attachment) {
        _clipper.clipEndWithSlot(slot);
        continue;
      }

      switch (attachment.constructor) {
        case RegionAttachment:
          const regionAttachment = <RegionAttachment>attachment;
          attachmentColor = regionAttachment.color;
          numFloats = vertexSize * 4;
          regionAttachment.computeWorldVertices(slot, tempVerts, 0, vertexSize);
          triangles = SpineGenerator.QUAD_TRIANGLES;
          uvs = regionAttachment.uvs;
          texture = regionAttachment.region.texture;
          break;
        case MeshAttachment:
          const meshAttachment = <MeshAttachment>attachment;
          attachmentColor = meshAttachment.color;
          numFloats = (meshAttachment.worldVerticesLength >> 1) * vertexSize;
          if (numFloats > vertices.length) {
            SpineGenerator.tempVerts = new Array(numFloats);
          }
          meshAttachment.computeWorldVertices(
            slot,
            0,
            meshAttachment.worldVerticesLength,
            tempVerts,
            0,
            vertexSize
          );
          triangles = meshAttachment.triangles;
          uvs = meshAttachment.uvs;
          texture = meshAttachment.region.texture;
          break;
        case ClippingAttachment:
          let clip = <ClippingAttachment>attachment;
          _clipper.clipStart(slot, clip);
          continue;
        default:
          _clipper.clipEndWithSlot(slot);
          continue;
      }

      if (texture != null) {
        let finalVertices: ArrayLike<number>;
        let finalVerticesLength: number;
        let finalIndices: ArrayLike<number>;
        let finalIndicesLength: number;

        const skeleton = slot.bone.skeleton;
        const skeletonColor = skeleton.color;
        const slotColor = slot.color;
        const finalColor = SpineGenerator.tempColor;
        const finalAlpha = skeletonColor.a * slotColor.a * attachmentColor.a;

        finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
        finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
        finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
        finalColor.a = finalAlpha;

        if (premultipliedAlpha) {
          finalColor.r *= finalAlpha;
          finalColor.g *= finalAlpha;
          finalColor.b *= finalAlpha;
        }

        if (isClipping) {
          const dark = SpineGenerator.tempDark;
          _clipper.clipTriangles(
            tempVerts,
            triangles,
            triangles.length,
            uvs,
            finalColor,
            dark,
            false
          );
          finalVertices = _clipper.clippedVertices;
          finalVerticesLength = finalVertices.length;
          finalIndices = _clipper.clippedTriangles;
          finalIndicesLength = finalIndices.length;
        } else {
          let verts = tempVerts;
          const { r, g, b, a } = finalColor;
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
          finalVertices = tempVerts;
          finalVerticesLength = numFloats;
          finalIndices = triangles;
          finalIndicesLength = triangles.length;
        }

        if (finalVerticesLength == 0 || finalIndicesLength == 0) {
          _clipper.clipEndWithSlot(slot);
          continue;
        }

        let indexStart = verticesLength / SpineGenerator.VERTEX_STRIDE;
        let vertices = _vertices;
        let i = verticesLength;
        let j = 0;
        for (; j < finalVerticesLength; ) {
          let x = finalVertices[j++];
          let y = finalVertices[j++];
          vertices[i++] = x;
          vertices[i++] = y;
          vertices[i++] = z;
          vertices[i++] = finalVertices[j++];
          vertices[i++] = finalVertices[j++];
          vertices[i++] = finalVertices[j++];
          vertices[i++] = finalVertices[j++];
          vertices[i++] = finalVertices[j++];
          vertices[i++] = finalVertices[j++];
          shouldUpdateBounds && this._expandByPoint(x, y, z, renderer);
        }
        verticesLength = i;

        let indicesArray = _indices;
        for (i = indicesLength, j = 0; j < finalIndicesLength; i++, j++) {
          indicesArray[i] = finalIndices[j] + indexStart;
        }
        indicesLength += finalIndicesLength;

        const slotData = slot.data;
        const slotName = slotData.name;
        blend = slotData.blendMode;
        const blendModeChanged =
          tempBlendMode !== null && tempBlendMode !== slotData.blendMode;
        const textureChanged = tempTexture !== null && tempTexture !== texture;
        const slotNeedSeparate = _separateSlots.get(slotName);

        if (slotNeedSeparate || blendModeChanged || textureChanged) {
          // Finish accumulated count first
          if (count > 0) {
            const origin = _subPrimitives[primitiveIndex];
            origin && primitiveIndex++;
            const subPrimitive = origin || subPrimitivePool.get();
            subPrimitive.start = start;
            subPrimitive.count = count;
            const renderItem = subRenderItemPool.get();
            renderItem.subPrimitive = subPrimitive;
            renderItem.texture = tempTexture;
            renderItem.blendMode = tempBlendMode;
            _subRenderItems.push(renderItem);
            start += count;
            count = 0;
          }
          if (slotNeedSeparate) {
            // If separatedTexture exist, set texture params
            const separateTexture = _separateSlotTextureMap.get(slotName);
            if (separateTexture) {
              const oldTexture = texture.texture;
              separateTexture.filterMode = oldTexture.filterMode;
              separateTexture.wrapModeU = oldTexture.wrapModeU;
              separateTexture.wrapModeV = oldTexture.wrapModeV;
            }
            const origin = _subPrimitives[primitiveIndex];
            origin && primitiveIndex++;
            const subPrimitive = origin || subPrimitivePool.get();
            subPrimitive.start = start;
            subPrimitive.count = finalIndicesLength;
            const renderItem = subRenderItemPool.get();
            renderItem.blendMode = blend;
            renderItem.subPrimitive = subPrimitive;
            renderItem.texture = texture;
            renderItem.slotName = slotName;
            _subRenderItems.push(renderItem);
            start += finalIndicesLength;
            count = 0;
          } else {
            count += finalIndicesLength;
          }
        } else {
          count += finalIndicesLength;
        }
        tempTexture = texture;
        tempBlendMode = blend;
      }

      _clipper.clipEndWithSlot(slot);
    } // slot traverse end

    // add reset sub primitive
    if (count > 0) {
      const origin = _subPrimitives[primitiveIndex];
      origin && primitiveIndex++;
      const subPrimitive = origin || subPrimitivePool.get();
      subPrimitive.start = start;
      subPrimitive.count = count;
      const renderItem = subRenderItemPool.get();
      renderItem.blendMode = blend;
      renderItem.subPrimitive = subPrimitive;
      renderItem.texture = texture;
      _subRenderItems.push(renderItem);
      count = 0;
    }

    _clipper.clipEnd();

    const lastLen = _subPrimitives.length;
    const curLen = _subRenderItems.length;
    if (curLen < lastLen) {
      for (let i = curLen; i < lastLen; i++) {
        const item = _subPrimitives[i];
        subPrimitivePool.return(item);
      }
    }

    renderer._clearSubPrimitives();
    for (let i = 0, l = curLen; i < l; ++i) {
      const item = _subRenderItems[i];
      const { slotName, blendMode, texture } = item;
      renderer._addSubPrimitive(item.subPrimitive);
      let subTexture = texture.texture;
      if (_separateSlotTextureMap.has(slotName)) {
        subTexture = _separateSlotTextureMap.get(slotName);
      }
      const key = `${subTexture.instanceId}_${blendMode}`;
      let material = SpineAnimationRenderer._materialCache.get(key);
      if (!material) {
        material = this._createMaterialForTexture(
          subTexture,
          engine,
          blendMode,
          premultipliedAlpha
        );
        SpineAnimationRenderer._materialCache.set(key, material);
      }
      renderer.setMaterial(i, material);
    }

    if (indicesLength > _vertexCount) {
      renderer._createAndBindBuffer(indicesLength);
      this.buildPrimitive(skeleton, renderer, shouldUpdateBounds);
      return;
    }

    renderer._vertexBuffer.setData(_vertices);
    renderer._indexBuffer.setData(_indices);
  }

  addSeparateSlot(slotName: string) {
    this._separateSlots.set(slotName, slotName);
  }

  addSeparateSlotTexture(slotName: string, texture: Texture2D) {
    this._separateSlotTextureMap.set(slotName, texture);
  }

  private _createMaterialForTexture(
    texture: Texture2D,
    engine: Engine,
    blendMode: BlendMode,
    premultipliedAlpha: boolean
  ): Material {
    const material = SpineAnimationRenderer._getDefaultMaterial(engine);
    material.shaderData.setTexture("material_SpineTexture", texture);
    setBlendMode(material, blendMode, premultipliedAlpha);
    return material;
  }

  private _expandByPoint(
    x: number,
    y: number,
    z: number,
    renderer: SpineAnimationRenderer
  ) {
    const { min, max } = renderer._localBounds;
    const newMinX = Math.min(min.x, x);
    const newMinY = Math.min(min.y, y);
    const newMinZ = Math.min(min.z, z);
    const newMaxX = Math.max(max.x, x);
    const newMaxY = Math.max(max.y, y);
    const newMaxZ = Math.max(max.z, z);
    min.set(newMinX, newMinY, newMinZ);
    max.set(newMaxX, newMaxY, newMaxZ);
  }
}
