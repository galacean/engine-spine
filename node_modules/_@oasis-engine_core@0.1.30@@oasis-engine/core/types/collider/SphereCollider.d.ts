import { Vector3 } from "@oasis-engine/math";
import { Entity } from "../Entity";
import { ASphereCollider } from "./ASphereCollider";
export declare class SphereCollider extends ASphereCollider {
    private __center;
    private __radius;
    private isShowCollider;
    get _center(): Vector3;
    set _center(value: Vector3);
    get _radius(): number;
    set _radius(value: number);
    constructor(entity: Entity);
}
