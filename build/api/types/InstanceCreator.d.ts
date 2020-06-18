import { ConstructorFunction } from '../../types';
export declare const makeInstanceModificator: (self: any) => any;
export declare const InstanceCreator: ConstructorFunction<{
    getExistentAsyncStack: (existentInstance: any) => any[];
    postProcessing: (this: any, continuationOf: any) => void;
    bindMethod: (this: any, instance: any, name: string, MethodItself: any) => void;
    bindProtoMethods: (this: any) => void;
    makeWaiter: (this: any, type: any, then: any) => any;
    proceedProto: (this: any) => void;
    addProps: (this: any) => void;
    addThen: (this: any, then: any) => void;
    undefineParentSubTypes: (this: any) => void;
    invokePreHooks: (this: any) => void;
    invokePostHooks: (this: any) => {
        type: any;
        collection: any;
        namespace: any;
    };
    throwModificationError: (this: any, error: any) => void;
}>;
