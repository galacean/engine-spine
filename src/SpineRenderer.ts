import { MeshBatcher } from './core/MeshBatcher';
import { Utils, ArrayLike } from './spine-core/Utils';
import { Skeleton } from './spine-core/Skeleton';
import { SkeletonData } from './spine-core/SkeletonData';
import { AnimationState } from './spine-core/AnimationState';
import { AnimationStateData } from './spine-core/AnimationStateData';
import { RegionAttachment } from './spine-core/attachments/RegionAttachment';
import { MeshAttachment } from './spine-core/attachments/MeshAttachment';
import {
  Script,
} from 'oasis-engine';

export class SpineRenderer extends Script {
  private static QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
  private static VERTEX_SIZE = 2 + 2 + 4;

  private vertices: ArrayLike<number> = new Float32Array(1024);
  private tempColor = [0, 0, 0, 0];

  private _skeleton: Skeleton;
  private _asset: SkeletonData;
  private _state: AnimationState;

  private _batches = new Array();
  private _nextBatchIndex = 0;
  private _vertexCount: number = 0;

  private _priority: number = 0;

  zOffset: number = 0.01;

  autoUpdate: boolean = true;

  get asset() {
    return this._asset;
  }

  get state() {
    return this._state;
  }

  get skeleton() {
    return this._skeleton;
  }

  get batches() {
    return this._batches;
  }

  setSkeletonData(asset: SkeletonData) {
    this._asset = asset;
    this._skeleton = new Skeleton(asset);
    const animData = new AnimationStateData(asset);
    this._state = new AnimationState(animData);
    this.getVertexCount();
  }

  setInitialRenderPriority(priority: number) {
    this._priority = priority;
  }

  disposeCurrentSkeleton() {
    this._asset = null;
    this.clearBatches();
    this._batches = [];
    const children = (this.entity as any).children;
    for (let i = 0; i < children.length; i += 1) {
      if (children[i].name === "batch") {
        children[i].destroy();
      }
    }
  }

  getVertexCount() {
    let drawOrder = this._skeleton.drawOrder;
    let vertexCount = 0;
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      let slot = drawOrder[i];
      if (!slot.bone.active) continue;
      let attachment = slot.getAttachment();
      if (!attachment) {
        continue;
      } else if (attachment instanceof RegionAttachment) {
        vertexCount += SpineRenderer.QUAD_TRIANGLES.length;
      } else if (attachment instanceof MeshAttachment) {
        let mesh = attachment;
        vertexCount += mesh.triangles.length;
      } else continue;
    }
    this._vertexCount = vertexCount;
  }


  onUpdate(delta: number) {
    if (this._asset && this.autoUpdate) {
      this.updateState(delta * 0.001);
    }
  }

  updateState(deltaTime: number) {
    const state = this._state;
    const skeleton = this._skeleton;

    state.update(deltaTime);
    state.apply(skeleton);
    skeleton.updateWorldTransform();

    this.updateGeometry();
  }

  private clearBatches() {
    for (var i = 0; i < this._batches.length; i++) {
      this._batches[i].clear();
      this._batches[i].enabled = false;
    }
    // 清0使，batch不会重新创建
    this._nextBatchIndex = 0;
  }

  private nextBatch() {
    if (this._batches.length == this._nextBatchIndex) {
      const batchNode = this.entity.createChild('batch');
      const batch = batchNode.addComponent(MeshBatcher);
      batch.renderPriority = this._priority;
      batch.initGeometry(this._vertexCount);
      batch.initMaterial();
      this._batches.push(batch);
    }
    const batch = this._batches[this._nextBatchIndex++];
    batch.enabled = true;
    return batch;
  }

  private updateGeometry() {
    this.clearBatches();
    let vertices = this.vertices;
    let triangles: Array<number>;
    let uvs: ArrayLike<number>;
    let drawOrder = this._skeleton.drawOrder;
    let batch = this.nextBatch();
    batch.begin();
    let z = 0;
    let zOffset = this.zOffset;
    const vertexSize = SpineRenderer.VERTEX_SIZE;
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      let slot = drawOrder[i];
      if (!slot.bone.active) continue;
      let attachment = slot.getAttachment();
      let attachmentColor = null;
      let texture = null;
      let numFloats = 0;
      if (!attachment) {
        continue;
      } else if (attachment instanceof RegionAttachment) {
        let region = attachment;
        attachmentColor = region.color;
        vertices = this.vertices;
        numFloats = vertexSize * 4;
        region.computeWorldVertices(slot.bone, vertices, 0, vertexSize);
        triangles = SpineRenderer.QUAD_TRIANGLES;
        uvs = region.uvs;
        texture = region.region.renderObject.texture;
      } else if (attachment instanceof MeshAttachment) {
        let mesh = attachment;
        attachmentColor = mesh.color;
        vertices = this.vertices;
        numFloats = (mesh.worldVerticesLength >> 1) * vertexSize;
        if (numFloats > vertices.length) {
          vertices = this.vertices = Utils.newFloatArray(numFloats);
        }
        mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, vertices, 0, vertexSize);
        triangles = mesh.triangles;
        uvs = mesh.uvs;
        texture = mesh.region.renderObject.texture;
      } else continue;

      if (texture != null) {
        let skeleton = slot.bone.skeleton;
        let skeletonColor = skeleton.color;
        let slotColor = slot.color;
        let alpha = skeletonColor.a * slotColor.a * attachmentColor.a;
        let color = this.tempColor;
        color = [
          skeletonColor.r * slotColor.r * attachmentColor.r,
          skeletonColor.g * slotColor.g * attachmentColor.g,
          skeletonColor.b * slotColor.b * attachmentColor.b,
          alpha
        ];

        let finalVertices: ArrayLike<number>;
        let finalVerticesLength: number;
        let finalIndices: ArrayLike<number>;
        let finalIndicesLength: number;

        let verts = vertices;
        for (let v = 2, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
          verts[v] = color[0];
          verts[v + 1] = color[1];
          verts[v + 2] = color[2];
          verts[v + 3] = color[3];
          verts[v + 4] = uvs[u];
          verts[v + 5] = uvs[u + 1];
        }
        finalVertices = vertices;
        finalVerticesLength = numFloats;
        finalIndices = triangles;
        finalIndicesLength = triangles.length;

        if (finalVerticesLength == 0 || finalIndicesLength == 0) continue;

        // Start new batch if this one can't hold vertices/indices
        if (!batch.canBatch(finalVerticesLength, finalIndicesLength)) {
          batch.end();
          batch = this.nextBatch();
          batch.begin();
        }

        // FIXME per slot blending would require multiple material support
        //let slotBlendMode = slot.data.blendMode;
        //if (slotBlendMode != blendMode) {
        //	blendMode = slotBlendMode;
        //	batcher.setBlendMode(getSourceGLBlendMode(this._gl, blendMode, premultipliedAlpha), getDestGLBlendMode(this._gl, blendMode));
        //}

        let batchMaterial = batch.material;
        if (batchMaterial.map == null) {
          batchMaterial.map = texture.texture;
        }
        if (batchMaterial.map != texture.texture) {
          batch.end();
          batch = this.nextBatch();
          batch.begin();
          batchMaterial = batch.material;
          batchMaterial.map = texture.texture;
        }
        batch.batch(finalVertices, finalVerticesLength, finalIndices, finalIndicesLength, z);
        z += zOffset;
      }
    }
    batch.end();
  }
}