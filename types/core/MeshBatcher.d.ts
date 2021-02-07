import { GeometryRenderer, Entity } from 'oasis-engine';
export declare class MeshBatcher extends GeometryRenderer {
    private static VERTEX_SIZE;
    private vertices;
    private indices;
    private indexBuffer;
    private vertexBuffer;
    private verticesLength;
    private indicesLength;
    constructor(entity: Entity);
    initGeometry(maxVertices: number): void;
    initMaterial({ stencil, blend, depthMask }: {
        stencil: any;
        blend: any;
        depthMask: any;
    }): void;
    clear(): void;
    begin(): void;
    canBatch(verticesLength: number, indicesLength: number): boolean;
    batch(vertices: ArrayLike<number>, verticesLength: number, indices: ArrayLike<number>, indicesLength: number, z?: number): void;
    end(): void;
}
