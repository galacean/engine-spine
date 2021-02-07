import { VertexEffect } from "../VertexEffect";
import { PowOut, Color, Vector2 } from "../Utils";
import { Skeleton } from "../Skeleton";
export declare class SwirlEffect implements VertexEffect {
    static interpolation: PowOut;
    centerX: number;
    centerY: number;
    radius: number;
    angle: number;
    private worldX;
    private worldY;
    constructor(radius: number);
    begin(skeleton: Skeleton): void;
    transform(position: Vector2, uv: Vector2, light: Color, dark: Color): void;
    end(): void;
}
