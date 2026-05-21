import { _Internal_TC_ } from '../../types';
export declare const Mnemosyne: _Internal_TC_<object>;
declare const _default: {
    readonly createMnemosyne: (Uranus: unknown, exposeInstanceMethods: boolean) => object;
    readonly prepareSubtypeForConstruction: (subtypeName: string, inheritedInstance: unknown) => _Internal_TC_<{
        getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
        postProcessing: (this: import("../../types").InstanceCreatorContext, continuationOf?: import("./Props").TypeDef) => void;
        makeAwaiter: (this: import("../../types").InstanceCreatorContext, type: import("./Props").TypeDef, then?: import("../../types").ThenSpec) => object;
        addThen: (this: import("../../types").InstanceCreatorContext, then: import("../../types").ThenSpec) => void;
        invokePreHooks: (this: import("../../types").InstanceCreatorContext) => void;
        invokePostHooks: (this: import("../../types").InstanceCreatorContext) => {
            type: Set<unknown>;
            collection: Set<unknown>;
        };
        throwModificationError: (this: import("../../types").InstanceCreatorContext, error: import("../../types").MnemonicaError) => void;
    }> | undefined;
    readonly getDefaultPrototype: () => any;
};
export default _default;
