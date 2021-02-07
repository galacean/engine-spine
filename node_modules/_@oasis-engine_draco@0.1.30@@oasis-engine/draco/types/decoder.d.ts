import { ITaskConfig } from "./DRACOWorker";
export declare class DRACODecoder {
    private pool;
    private workerLimit;
    private useJS;
    private currentTaskId;
    private taskCache;
    private loadLibPromise;
    constructor(config?: IDecoderConfig);
    private preloadLib;
    private getWorker;
    decode(buffer: ArrayBuffer, taskConfig: ITaskConfig): Promise<any>;
}
interface IDecoderConfig {
    type?: "js" | "wasm";
    workerLimit?: number;
}
export {};
