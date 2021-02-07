import { Vector3 } from "@oasis-engine/math";
import { Entity } from "../Entity";
import { ABoxCollider } from "./ABoxCollider";
export declare class BoxCollider extends ABoxCollider {
    private _center;
    private _size;
    private isShowCollider;
    get center(): Vector3;
    set center(value: Vector3);
    get size(): Vector3;
    set size(value: Vector3);
    constructor(entity: Entity);
}
