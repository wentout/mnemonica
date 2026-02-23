import { ConstructorFunction } from '../../types';
declare const _default: {
    readonly createMnemosyne: (Uranus: unknown) => any;
    readonly prepareSubtypeForConstruction: (subtypeName: string, inheritedInstance: any) => ConstructorFunction<{
        getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
        postProcessing: (this: any, continuationOf: any) => void;
        makeAwaiter: (this: any, type: any, then?: import("./InstanceCreator").ThenSpec) => any;
        addThen: (this: any, then: import("./InstanceCreator").ThenSpec) => void;
        invokePreHooks: (this: any) => void;
        invokePostHooks: (this: any) => {
            type: void;
            collection: void;
        };
        throwModificationError: (this: any, error: any) => void;
    }> | undefined;
    readonly getDefaultPrototype: () => any;
};
export default _default;
