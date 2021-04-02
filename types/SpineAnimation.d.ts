import { Skeleton } from './spine-core/Skeleton';
import { SkeletonData } from './spine-core/SkeletonData';
import { AnimationState } from './spine-core/AnimationState';
import { MeshGenerator } from './core/MeshGenerator';
import { Script, Entity } from 'oasis-engine';
export declare class SpineAnimation extends Script {
    private _skeletonData;
    private _skeleton;
    private _state;
    protected _meshGenerator: MeshGenerator;
    get skeletonData(): SkeletonData;
    get skeleton(): Skeleton;
    get state(): AnimationState;
    get mesh(): import("oasis-engine").BufferMesh;
    set scale(v: number);
    constructor(entity: Entity);
    setSkeletonData(skeletonData: SkeletonData): void;
    disposeCurrentSkeleton(): void;
    onUpdate(delta: number): void;
    updateState(deltaTime: number): void;
    updateGeometry(): void;
}
