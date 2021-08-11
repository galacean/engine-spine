import {
  BufferMesh,
  Engine,
  Buffer,
  VertexElement,
  VertexElementFormat,
  BufferBindFlag,
  IndexFormat,
  BufferUsage,
} from 'oasis-engine';
import { MeshGenerator } from './MeshGenerator';

export class SpineMesh {

  private _mesh: BufferMesh;

  private _indexBuffer: Buffer;
  private _vertexBuffer: Buffer;

  get mesh() {
    return this._mesh;
  }

  get indexBuffer() {
    return this._indexBuffer;
  }

  get vertexBuffer() {
    return this._vertexBuffer;
  }

  initialize(engine: Engine, vertexCount: number) {
    const mesh = this._mesh = new BufferMesh(engine);

    const vertexElements = [
      new VertexElement('POSITION', 0, VertexElementFormat.Vector3, 0),
      new VertexElement('COLOR_0', 12, VertexElementFormat.Vector4, 0),
      new VertexElement('TEXCOORD_0', 28, VertexElementFormat.Vector2, 0),
    ];

    const vertexStride = (MeshGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
    const byteLength = vertexStride * vertexCount;
    const vertexBuffer = new Buffer(
      engine,
      BufferBindFlag.VertexBuffer,
      byteLength,
      BufferUsage.Dynamic
    );

    const indexBuffer = new Buffer(
      engine,
      BufferBindFlag.IndexBuffer,
      vertexCount * 2,
      BufferUsage.Dynamic
    );

    this._indexBuffer = indexBuffer;
    this._vertexBuffer = vertexBuffer;

    mesh.setVertexBufferBinding(vertexBuffer, vertexStride);
    mesh.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    mesh.setVertexElements(vertexElements);
    mesh.addSubMesh(0, vertexCount);
  }

  changeBuffer(engine: Engine, vertexCount: number) {
    const vertexStride = (MeshGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
    const byteLength = vertexStride * vertexCount;
    const vertexBuffer = new Buffer(
      engine,
      BufferBindFlag.VertexBuffer,
      byteLength,
      BufferUsage.Dynamic
    );

    const indexBuffer = new Buffer(
      engine,
      BufferBindFlag.IndexBuffer,
      vertexCount * 2,
      BufferUsage.Dynamic
    );
    const mesh = this._mesh;
    this._indexBuffer = indexBuffer;
    this._vertexBuffer = vertexBuffer;
    mesh.setVertexBufferBinding(vertexBuffer, vertexStride);
    mesh.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);
  }
}