import { DataType } from "../base/Constant";
import { IndexFormat } from "./enums/IndexFormat";
export interface ElementInfo {
    size: number;
    type: DataType;
}
export declare class BufferUtil {
    static _getGLIndexType(indexFormat: IndexFormat): DataType;
}
