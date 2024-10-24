import { BufferBindFlag, Engine, Buffer, BufferUsage, VertexBufferBinding } from "@galacean/engine";
import { SpineGenerator } from "./SpineGenerator";

export class DoubleBuffer {
  _indexBufferA: Buffer;
  _vertexBufferA: Buffer;

  _indexBufferB: Buffer;
  _vertexBufferB: Buffer;

  usingA = true;
  enable = true;
  
  getCurrent() {
    if (this.enable === false) {
      return {
        indexBuffer: this._indexBufferA,
        vertexBuffer: this._vertexBufferA,
      }
    }
    return this.usingA ? {
      indexBuffer: this._indexBufferA,
      vertexBuffer: this._vertexBufferA,
    } : {
      indexBuffer: this._indexBufferB,
      vertexBuffer: this._vertexBufferB,
    }
  }
  
  getNext() {
    this.usingA = !this.usingA;
    return this.getCurrent();
  }

  resize(vertexCount: number, engine: Engine) {
    const vertexStride = (SpineGenerator.VERTEX_STRIDE) * 4; // position + color + uv * Float32 byteLen
    const byteLength = vertexStride * vertexCount;
    let currentBuffer;
    if (this.enable) {
      currentBuffer = this.usingA ? this._vertexBufferB : this._vertexBufferA;
    } else {
      currentBuffer = this._vertexBufferA;
    }

    if (!currentBuffer || currentBuffer.byteLength !== byteLength) {
      const vertexBuffer = new Buffer(
        engine,
        BufferBindFlag.VertexBuffer,
        byteLength,
        BufferUsage.Static,
      );
      
      const indexBuffer = new Buffer(
        engine,
        BufferBindFlag.IndexBuffer,
        vertexCount * 2,
        BufferUsage.Static,
      );

      if (this.enable === false) {
        this._indexBufferA = indexBuffer;
        this._vertexBufferA = vertexBuffer;
        return;
      }

      if (!this.usingA) {
        this._indexBufferA = indexBuffer;
        this._vertexBufferA = vertexBuffer;
      } else {
        this._indexBufferB = indexBuffer;
        this._vertexBufferB = vertexBuffer;
      }
    }
  }

}