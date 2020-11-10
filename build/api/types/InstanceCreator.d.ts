import { ConstructorFunction } from '../../types';
export declare const InstanceCreator: ConstructorFunction<{
    getExistentAsyncStack: (existentInstance: any) => any[];
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
}>;
