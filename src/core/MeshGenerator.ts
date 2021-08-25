import {
  Engine,
  Entity,
  MeshRenderer,
  SubMesh,
} from 'oasis-engine';
import { Skeleton } from '../spine-core/Skeleton';
import { SkeletonData } from '../spine-core/SkeletonData';
import { RegionAttachment } from '../spine-core/attachments/RegionAttachment';
import { MeshAttachment } from '../spine-core/attachments/MeshAttachment';
import { ClippingAttachment } from '../spine-core/attachments/ClippingAttachment';
import { ArrayLike, Color } from '../spine-core/Utils';
import { SkeletonClipping } from '../spine-core/SkeletonClipping';
import { SpineMesh } from './SpineMesh';
import { SpineRenderSetting } from '../types';

type SubMeshItem = {
  subMesh: SubMesh;
  name: string;
}
export class MeshGenerator {
  static QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
  static VERTEX_SIZE = 8; // 2 2 4 position without z, uv, color
  static VERTEX_STRIDE = 9; // 3 2 4 position with z, uv, color
  static tempColor: Color = new Color();

  private _setting: SpineRenderSetting;
  private _engine: Engine;
  private _entity: Entity;
  private _clipper: SkeletonClipping = new SkeletonClipping();
  private _spineMesh: SpineMesh = new SpineMesh();

  private _vertexCount: number;
  private _vertices: Float32Array;
  private _verticesWithZ: Float32Array;
  private _indices: Uint16Array;
  private _needResize: boolean = false;
  private _meshRenderer: MeshRenderer;
  private _seperateSubMeshItems: SubMeshItem[] = [];
  private _restSubMeshItems: SubMeshItem[] = [];
  private _subMeshItems: SubMeshItem[] = [];
  readonly separateSlots: string[] = [];

  get mesh() {
    return this._spineMesh.mesh;
  }

  get subMeshItems() {
    return this._subMeshItems;
  }

  constructor(engine: Engine, entity: Entity) {
    this._engine = engine;
    this._entity = entity;
  }

  initialize(skeletonData: SkeletonData, setting?: SpineRenderSetting) {
    if (!skeletonData) return;

    const meshRenderer = this._entity.getComponent(MeshRenderer);
    if (!meshRenderer) {
      console.warn('You need add MeshRenderer component to entity first');
      return;
    }
    this._meshRenderer = meshRenderer;

    if (setting) {
      this._setting = setting;
    }

    // Prepare buffer by using all attachment data but clippingAttachment
    const { defaultSkin: { attachments } } = skeletonData;
    let vertexCount: number = 0;
    const QUAD_TRIANGLE_LENGTH = MeshGenerator.QUAD_TRIANGLES.length;
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
    const { _spineMesh } = this;
    _spineMesh.initialize(this._engine, this._vertexCount);
    meshRenderer.mesh = _spineMesh.mesh;
  }

  buildMesh(skeleton: Skeleton) {
    const {
      useClipping = true,
      zSpacing = 0.01,
    } = this._setting || {};

    let verticesLength = 0;
    let indicesLength = 0;
    this._seperateSubMeshItems.length = 0;
    this._restSubMeshItems.length = 0;
    this._subMeshItems.length = 0;
    
    const meshRenderer = this._meshRenderer;
    const drawOrder = skeleton.drawOrder;
    const maxSlotCount = drawOrder.length;
    const { _clipper, _spineMesh } = this;
    const { mesh } = _spineMesh;
    const seperateSubMeshItems = this._seperateSubMeshItems;
    const restSubMeshItems = this._restSubMeshItems;
    const subMeshItems = this._subMeshItems;
    let vertices: ArrayLike<number> = this._vertices;
    let triangles: Array<number>;
    let uvs: ArrayLike<number>;
    let start = 0;
    let count = 0;
    for (let slotIndex = 0; slotIndex < maxSlotCount; slotIndex += 1) {
      const slot = drawOrder[slotIndex];

      if (!slot.bone.active) {
        _clipper.clipEndWithSlot(slot);
        continue;
      }
      const attachment = slot.getAttachment();
      let attachmentColor: Color = null;
      let texture = null;
      const z = zSpacing * slotIndex;
      let numFloats = 0;
      let vertexSize = _clipper.isClipping() ? 2 : MeshGenerator.VERTEX_SIZE;
      if (
        attachment instanceof RegionAttachment
      ) {
        let regionAttachment = <RegionAttachment>attachment;
        attachmentColor = regionAttachment.color;
        vertices = this._vertices;
        numFloats = vertexSize * 4;
        regionAttachment.computeWorldVertices(slot.bone, vertices, 0, vertexSize);
        triangles = MeshGenerator.QUAD_TRIANGLES;
        uvs = regionAttachment.uvs;
        texture = regionAttachment.region.renderObject.texture;
      } else if (
        attachment instanceof MeshAttachment
      ) {
        let meshAttachment = <MeshAttachment>attachment;
        attachmentColor = meshAttachment.color;
        vertices = this._vertices;
        numFloats = (meshAttachment.worldVerticesLength >> 1) * vertexSize;
        if (numFloats > vertices.length) {
          vertices = this._vertices = new Float32Array(numFloats);
        }
        meshAttachment.computeWorldVertices(slot, 0, meshAttachment.worldVerticesLength, vertices, 0, vertexSize);
        triangles = meshAttachment.triangles;
        uvs = meshAttachment.uvs;
        texture = meshAttachment.region.renderObject.texture;
      }  else if (
        attachment instanceof ClippingAttachment
      ) {
        if (useClipping) {
          let clip = <ClippingAttachment>(attachment);
          _clipper.clipStart(slot, clip);
          continue;
        }
      } else if (useClipping) { // attachment might be null or BoundingBoxAttachment
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
        let color = MeshGenerator.tempColor;
        color.set(skeletonColor.r * slotColor.r * attachmentColor.r,
            skeletonColor.g * slotColor.g * attachmentColor.g,
            skeletonColor.b * slotColor.b * attachmentColor.b,
            alpha);

        if (_clipper.isClipping()) {
          _clipper.clipTriangles(vertices, numFloats, triangles, triangles.length, uvs, color, null, false);
          let clippedVertices = _clipper.clippedVertices;
          let clippedTriangles = _clipper.clippedTriangles;
          finalVertices = clippedVertices;
          finalVerticesLength = clippedVertices.length;
          finalIndices = clippedTriangles;
          finalIndicesLength = clippedTriangles.length;
        } else {
          let verts = vertices;
          for (let v = 2, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
            verts[v] = color.r;
            verts[v + 1] = color.g;
            verts[v + 2] = color.b;
            verts[v + 3] = color.a;
            verts[v + 4] = uvs[u];
            verts[v + 5] = uvs[u + 1];
          }
          finalVertices = vertices;
          finalVerticesLength = numFloats;
          finalIndices = triangles;
          finalIndicesLength = triangles.length;
        }

        let indexStart = verticesLength / MeshGenerator.VERTEX_STRIDE;
        let verticesWithZ = this._verticesWithZ;
        let i = verticesLength;
        let j = 0;
        for (; j < finalVerticesLength;) {
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

        // add submesh
        const slotName = slot.data.name;
        const needSeparate = this.separateSlots.includes(slotName);

        if (needSeparate) {
          const subMesh = new SubMesh(indicesLength, finalIndicesLength);
          seperateSubMeshItems.push({
            name: slotName,
            subMesh,
          });
          if (count > 0) {
            const prevSubMesh = new SubMesh(start, count);
            restSubMeshItems.push({
              name: 'default',
              subMesh: prevSubMesh,
            });
            count = 0;
          }
          start = indicesLength + finalIndicesLength;
        } else {
          count += finalIndicesLength;
        }
        
        indicesLength += finalIndicesLength;

        const materials = meshRenderer.getMaterials();
        const materialLength = materials.length;
        for (let i = 0; i < materialLength; i += 1) {
          const mtl = materials[i];
          if (!mtl.shaderData.getTexture('u_spriteTexture')) {
            mtl.shaderData.setTexture('u_spriteTexture', texture.texture);
          }
        }
      }

      _clipper.clipEndWithSlot(slot);

    } // slot traverse end

    _clipper.clipEnd();

    // add reset sub mesh
    if (count > 0) {
      const subMesh = new SubMesh(start, count);
      restSubMeshItems.push({
        name: 'default',
        subMesh,
      });
      count = 0;
    }

    // sort sub-mesh
    const seperateSubMeshItemLength = seperateSubMeshItems.length;
    const restSubMeshItemLength = restSubMeshItems.length;
    for (let i = 0; i < seperateSubMeshItemLength; i += 1) {
      subMeshItems.push(seperateSubMeshItems[i]);
    }
    for (let i = 0; i < restSubMeshItemLength; i += 1) {
      subMeshItems.push(restSubMeshItems[i]);
    }
    subMeshItems.sort((a, b) => a.subMesh.start - b.subMesh.start);

    // update buffer when vertex count change
    if (indicesLength > 0 && indicesLength !== this._vertexCount) {
      if (indicesLength > this._vertexCount) {
        this._vertexCount = indicesLength;
        this._prepareBufferData(this._vertexCount);
        this._needResize = true;
        return;
      }
    }

    // update sub-mesh
    mesh.clearSubMesh();
    const subMeshItemLength = subMeshItems.length;
    for (let i = 0; i < subMeshItemLength; i += 1) {
      mesh.addSubMesh(subMeshItems[i].subMesh);
    }

    if (this._needResize) {
      // #1
      _spineMesh.vertexBuffer.resize(this._verticesWithZ.byteLength);
      _spineMesh.indexBuffer.resize(this._indices.byteLength);
      // #2 https://github.com/oasis-engine/engine/issues/376
      // spineMesh.changeBuffer(this.engine, this.vertexCount);
      this._needResize = false;
    }
    _spineMesh.vertexBuffer.setData(this._verticesWithZ);
    _spineMesh.indexBuffer.setData(this._indices);
  }

  addSeparateSlot(slotName: string) {
    this.separateSlots.push(slotName);
  }

  private _prepareBufferData(vertexCount: number) {
    this._vertices = new Float32Array(vertexCount * MeshGenerator.VERTEX_SIZE);
    this._verticesWithZ = new Float32Array(vertexCount * MeshGenerator.VERTEX_STRIDE);
    this._indices = new Uint16Array(vertexCount);
  }
}