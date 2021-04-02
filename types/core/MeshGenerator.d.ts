import { Engine, Entity } from 'oasis-engine';
import { Skeleton } from '../spine-core/Skeleton';
export declare type Setting = {
    useClipping: boolean;
    zSpacing: number;
};
export declare class MeshGenerator {
    static QUAD_TRIANGLES: number[];
    static VERTEX_SIZE: number;
    static VERTEX_STRIDE: number;
    private setting;
    private engine;
    private entity;
    private clipper;
    private spineMesh;
    private vertexCount;
    private indicesLength;
    private verticesLength;
    private vertices;
    private verticesWithZ;
    private indices;
    private tempColor;
    get mesh(): import("oasis-engine").BufferMesh;
    constructor(engine: Engine, entity: Entity);
    buildMesh(skeleton: Skeleton): void;
    fillVertexData(): void;
    fillIndexData(): void;
    addSubMesh(skeleton: Skeleton): void;
    getVertexCount(skeleton: Skeleton): number;
}
