import { ConstructorFunction } from '../../types';
declare const _default: {
    readonly createMnemosyne: (Uranus: unknown) => object;
    readonly prepareSubtypeForConstruction: (subtypeName: string, inheritedInstance: unknown) => ConstructorFunction<{
        getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
        postProcessing: (this: any, continuationOf: any) => void;
        makeAwaiter: (this: any, type: any, then?: import("./InstanceCreator").ThenSpec) => any;
        addThen: (this: any, then: import("./InstanceCreator").ThenSpec) => void;
        invokePreHooks: (this: any) => void;
        invokePostHooks: (this: any) => {
            type: void;
            collection: void;
        };
        throwModificationError: (this: {
            [key: string]: unknown;
            TypeName: string;
            type: {
                stack: string;
            };
            args: unknown[];
            ModificatorType: CallableFunction;
            InstanceModificator: new (...args: unknown[]) => {
                stack: string[];
            };
            inheritedInstance?: unknown;
            invokePostHooks(): {
                type: Set<unknown>;
                collection: Set<unknown>;
            };
        }, error: import("../../types").MnemonicaError) => void;
    }> | undefined;
    readonly getDefaultPrototype: () => any;
};
export default _default;
