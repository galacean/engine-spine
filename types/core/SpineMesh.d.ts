import { BufferMesh, Engine } from 'oasis-engine';
export declare class SpineMesh {
    private _mesh;
    private indexBuffer;
    private vertexBuffer;
    get mesh(): BufferMesh;
    initialize(engine: Engine, maxVertices: number): void;
    fillVertexData(vertexData: ArrayBuffer | ArrayBufferView): void;
    fillIndexData(indexData: ArrayBuffer | ArrayBufferView): void;
}
