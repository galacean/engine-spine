import { Vector3 } from "./Vector3";
export declare class Spherical {
    radius: any;
    phi: any;
    theta: any;
    constructor(radius?: any, phi?: any, theta?: any);
    set(radius: any, phi: any, theta: any): this;
    makeSafe(): this;
    setFromVec3(v3: Vector3): this;
    setToVec3(v3: Vector3): this;
}
