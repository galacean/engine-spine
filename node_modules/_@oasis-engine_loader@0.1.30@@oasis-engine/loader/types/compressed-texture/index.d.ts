import { CompressedTextureData, CompressedCubeData } from "./type";
export declare function parseSingleKTX(data: ArrayBuffer): CompressedTextureData;
export declare function parseCubeKTX(dataArray: ArrayBuffer[]): CompressedCubeData;
