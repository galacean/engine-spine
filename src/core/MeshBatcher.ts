import {
  GeometryRenderer,
  Buffer,
  Entity,
  BufferGeometry,
  VertexElement,
  VertexElementFormat,
  BufferBindFlag,
  IndexFormat,
  BufferUsage,
} from 'oasis-engine';
import { SkeletonMaterial } from './SkeletonMaterial';

export class MeshBatcher extends GeometryRenderer {
  private static VERTEX_SIZE = 9;

  private vertices: Float32Array;
  private indices: Uint16Array;

  private indexBuffer: Buffer;
  private vertexBuffer: Buffer;

  private verticesLength = 0;
  private indicesLength = 0;

  constructor(entity: Entity) {
    super(entity);
  }

  initGeometry(maxVertices: number) {
    const geometry = new BufferGeometry(this.engine, 'spine_batch_geometry');
    
    const vertices = new Float32Array(maxVertices * MeshBatcher.VERTEX_SIZE);
    const indices = new Uint16Array(maxVertices * 3);

    this.vertices = vertices;
    this.indices = indices;

    const vertexElements = [
      new VertexElement('POSITION', 0, VertexElementFormat.Vector3, 0),
      new VertexElement('COLOR', 12, VertexElementFormat.Vector4, 0),
      new VertexElement('TEXCOORD_0', 28, VertexElementFormat.Vector2, 0),
    ];

    const vertexStride = 36 // 12 + 16 + 8
    const byteLength = vertexStride * maxVertices
    const vertexBuffer = new Buffer(
      this.engine,
      BufferBindFlag.VertexBuffer,
      byteLength,
      BufferUsage.Dynamic
    );

    const indexBuffer = new Buffer(
      this.engine,
      BufferBindFlag.IndexBuffer,
      indices,
      BufferUsage.Dynamic
    );

    this.indexBuffer = indexBuffer;
    this.vertexBuffer = vertexBuffer;

    geometry.setVertexBufferBinding(vertexBuffer, vertexStride);
    geometry.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    geometry.setVertexElements(vertexElements);
    geometry.addSubGeometry(0, indices.length);

    this.geometry = geometry;
  }

  initMaterial({ stencil, blend, depthMask }) {
    this.material = new SkeletonMaterial(this.engine, 'skeleton_material', { stencil, blend, depthMask });
  }

  clear() {}

  begin() {
    this.verticesLength = 0;
    this.indicesLength = 0;
  }

  canBatch(verticesLength: number, indicesLength: number) {
    if (this.indicesLength + indicesLength >= this.indices.byteLength / 2) return false;
    if (this.verticesLength + verticesLength >= this.vertices.byteLength / 2) return false;
    return true;
  }

  batch(
    vertices: ArrayLike<number>, 
    verticesLength: number, 
    indices: ArrayLike<number>, 
    indicesLength: number, 
    z: number = 0
  ) {
    let indexStart = this.verticesLength / MeshBatcher.VERTEX_SIZE;
    let vertexBuffer = this.vertices;
    let i = this.verticesLength;
    let j = 0;
    for (; j < verticesLength; ) {
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = z;
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
      vertexBuffer[i++] = vertices[j++];
    }
    this.vertexBuffer.setData(this.vertices);
    this.verticesLength = i;

    let indicesArray = this.indices;
    for (i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
      indicesArray[i] = indices[j] + indexStart;
    this.indicesLength += indicesLength;
    this.indexBuffer.setData(this.indices);
  }

  end() {
    // end batch
  }
}