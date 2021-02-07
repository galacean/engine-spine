import { TweenerBase } from "./TweenerBase";
declare class TweenSequence extends TweenerBase {
    tweenersInfo: any;
    private _timePosition;
    callbacksInfo: any;
    currentTime: any;
    constructor(getter: any, setter: any, endValue: any, interval: any, options: {}, target: any);
    append(tweener: any): this;
    duration(): any;
    insert(tweener: any, timePosition: any): this;
    insertCallback(timePosition: any, callback: any): void;
    join(tweener: any): this;
    update(deltaTime: any): void;
}
export { TweenSequence };
