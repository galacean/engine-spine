import {
  BufferMesh,
  Engine,
  Buffer,
  VertexElement,
  VertexElementFormat,
  BufferBindFlag,
  IndexFormat,
  BufferUsage,
  Primitive,
  MeshTopology,
  VertexBufferBinding,
  IndexBufferBinding,
} from '@galacean/engine';
import { SpineGenerator } from './SpineGenerator';

export class SubPrimitive {
  /** Start drawing offset. */
  start: number;
  /** Drawing count. */
  count: number;
  /** Drawing topology. */
  topology?: MeshTopology = MeshTopology.Triangles;
}

export class SpinePrimitive {
  private _primitive: Primitive;
  private _subPrimitive: SubPrimitive[] = [];

  private _indexBuffer: Buffer;
  private _vertexBuffer: Buffer;

  get primitive() {
    return this._primitive;
  }

  get subPrimitive() {
    return this._subPrimitive;
  }

  get indexBuffer() {
    return this._indexBuffer;
  }

  get vertexBuffer() {
    return this._vertexBuffer;
  }

  initialize(engine: Engine, vertexCount: number) {
    const primitive = new Primitive(engine);
    this._primitive = primitive;
    primitive.addVertexElement(new VertexElement('POSITION', 0, VertexElementFormat.Vector3, 0));
    primitive.addVertexElement(new VertexElement('COLOR_0', 12, VertexElementFormat.Vector4, 0));
    primitive.addVertexElement(new VertexElement('TEXCOORD_0', 28, VertexElementFormat.Vector2, 0));
    const vertexStride = (SpineGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
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
    const vertexBufferBinding = new VertexBufferBinding(vertexBuffer, vertexStride);
    primitive.setVertexBufferBinding(0, vertexBufferBinding);
    const indexBufferBinding = new IndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    primitive.setIndexBufferBinding(indexBufferBinding);
    const subPrimitive = new SubPrimitive();
    subPrimitive.start = 0;
    subPrimitive.count = vertexCount;
    this.addSubPrimitive(subPrimitive);
  }

  addSubPrimitive(subPrimitive: SubPrimitive) {
    this._subPrimitive.push(subPrimitive);
  }

  clearSubPrimitive() {
    this._subPrimitive.length = 0;
  }

  changeBuffer(engine: Engine, vertexCount: number) {
    const vertexStride = (SpineGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
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
    const primitive = this._primitive;
    this._indexBuffer = indexBuffer;
    this._vertexBuffer = vertexBuffer;
    const vertexBufferBinding = new VertexBufferBinding(vertexBuffer, vertexStride);
    primitive.setVertexBufferBinding(0, vertexBufferBinding);
    const indexBufferBinding = new IndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    primitive.setIndexBufferBinding(indexBufferBinding);
  }
}
