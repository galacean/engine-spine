import { VertexEffect } from "../VertexEffect";
import { Skeleton } from "../Skeleton";
import { Color, Vector2 } from "../Utils";
export declare class JitterEffect implements VertexEffect {
    jitterX: number;
    jitterY: number;
    constructor(jitterX: number, jitterY: number);
    begin(skeleton: Skeleton): void;
    transform(position: Vector2, uv: Vector2, light: Color, dark: Color): void;
    end(): void;
}
