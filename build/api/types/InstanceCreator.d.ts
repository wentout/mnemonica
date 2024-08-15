import { ConstructorFunction } from '../../types';
declare const InstanceCreatorPrototype: {
    getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
    postProcessing: (this: any, continuationOf: any) => void;
    bindMethod: (this: any, instance: any, methodName: string, MethodItself: any) => void;
    bindProtoMethods: (this: any) => void;
    makeWaiter: (this: any, type: any, then: any) => any;
    addProps: (this: any) => any;
    addThen: (this: any, then: any) => void;
    invokePreHooks: (this: any) => void;
    invokePostHooks: (this: any) => {
        type: any;
        collection: any;
        namespace: any;
    };
    throwModificationError: (this: any, error: any) => void;
};
export declare const InstanceCreator: ConstructorFunction<typeof InstanceCreatorPrototype>;
export {};
