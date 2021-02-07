import { Entity } from "../Entity";
import { GeometryRenderer } from "../geometry/GeometryRenderer";
export declare class Model extends GeometryRenderer {
    private _props;
    private _geometryType;
    set geometryType(value: GeometryType);
    get geometryType(): GeometryType;
    constructor(entity: Entity);
    get material(): any;
    set material(mtl: any);
    init(props: any): void;
    setProp(key: string, value: any): void;
}
declare enum GeometryType {
    Box = "Box",
    Cylinder = "Cylinder",
    Plane = "Plane",
    Sphere = "Sphere"
}
export {};
