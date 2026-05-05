import { _Internal_TC_, InstanceCreatorContext, ThenSpec, TypeDef, MnemonicaError } from '../../types';
declare const InstanceCreatorPrototype: {
    getExistentAsyncStack: (existentInstance: import("../utils").asyncStack) => unknown;
    postProcessing: (this: InstanceCreatorContext, continuationOf?: TypeDef) => void;
    makeAwaiter: (this: InstanceCreatorContext, type: TypeDef, then?: ThenSpec) => object;
    addThen: (this: InstanceCreatorContext, then: ThenSpec) => void;
    invokePreHooks: (this: InstanceCreatorContext) => void;
    invokePostHooks: (this: InstanceCreatorContext) => {
        type: Set<unknown>;
        collection: Set<unknown>;
    };
    throwModificationError: (this: InstanceCreatorContext, error: MnemonicaError) => void;
};
export declare const InstanceCreator: _Internal_TC_<typeof InstanceCreatorPrototype>;
export {};
