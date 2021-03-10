import {
  Mesh,
  Engine,
  Buffer,
  VertexElement,
  VertexElementFormat,
  BufferBindFlag,
  IndexFormat,
  BufferUsage,
  SetDataOptions
} from 'oasis-engine';

export class MeshBuffer {

  private _mesh: Mesh;

  private indexBuffer: Buffer;
  private vertexBuffer: Buffer;

  get mesh() {
    return this._mesh;
  }

  initialize(engine: Engine, maxVertices: number) {
    const mesh = this._mesh = new Mesh(engine);

    const indices = new Uint16Array(maxVertices);

    const vertexElements = [
      new VertexElement('POSITION', 0, VertexElementFormat.Vector3, 0),
      new VertexElement('COLOR', 12, VertexElementFormat.Vector4, 0),
      new VertexElement('TEXCOORD', 28, VertexElementFormat.Vector2, 0),
    ];

    const vertexStride = 36;
    const byteLength = vertexStride * maxVertices;
    const vertexBuffer = new Buffer(
      engine,
      BufferBindFlag.VertexBuffer,
      byteLength,
      BufferUsage.Dynamic
    );

    const indexBuffer = new Buffer(
      engine,
      BufferBindFlag.IndexBuffer,
      indices,
      BufferUsage.Dynamic
    );

    this.indexBuffer = indexBuffer;
    this.vertexBuffer = vertexBuffer;

    mesh.setVertexBufferBinding(vertexBuffer, vertexStride);
    mesh.setIndexBufferBinding(indexBuffer, IndexFormat.UInt16);
    mesh.setVertexElements(vertexElements);
    mesh.addSubMesh(0, indices.length);
  }

  fillVertexData(vertexData: ArrayBuffer | ArrayBufferView) {
    this.vertexBuffer.setData(
      vertexData,
      0,
      0,
      0,
      SetDataOptions.Discard
    );
  }

  fillIndexData(indexData: ArrayBuffer | ArrayBufferView) {
    this.indexBuffer.setData(
      indexData,
      0,
      0,
      0,
      SetDataOptions.Discard
    );
  }

}