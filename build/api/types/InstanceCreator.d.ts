import { ConstructorFunction } from '../../types';
export interface ThenSpec {
    subtype: object;
    args: unknown[];
    name?: string;
}
declare const InstanceCreatorPrototype: {
    getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
    postProcessing: (this: any, continuationOf: any) => void;
    makeAwaiter: (this: any, type: any, then?: ThenSpec) => any;
    addThen: (this: any, then: ThenSpec) => void;
    invokePreHooks: (this: any) => void;
    invokePostHooks: (this: any) => {
        type: void;
        collection: void;
    };
    throwModificationError: (this: any, error: any) => void;
};
export declare const InstanceCreator: ConstructorFunction<typeof InstanceCreatorPrototype>;
export {};
