/** The base class for all constraint datas. */
export declare abstract class ConstraintData {
    name: string;
    order: number;
    skinRequired: boolean;
    constructor(name: string, order: number, skinRequired: boolean);
}
