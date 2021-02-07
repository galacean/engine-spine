export declare class DRACOWorker {
    private _worker;
    private _costs;
    private _currentLoad;
    private _callbacks;
    get currentLoad(): number;
    constructor(workerSourceURL: string, decoderWASMBinary?: ArrayBuffer);
    setCosts(taskId: number, cost: number): void;
    addCurrentLoad(cost: number): void;
    setCallback(taskId: number, resolve: (any: any) => void, reject: (any: any) => void): void;
    decode(taskId: number, taskConfig: ITaskConfig, buffer: ArrayBuffer): void;
    releaseTask(taskId: number): void;
}
export interface ITaskConfig {
    attributeIDs: {
        [attribute: string]: number;
    };
    attributeTypes: {
        [attribute: string]: string;
    };
    useUniqueIDs: boolean;
    indexType: string;
}
