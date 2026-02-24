import type { MnemonicaError } from '../../types';
type InstanceCreatorContext = {
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
    [key: string]: unknown;
};
export declare const throwModificationError: (this: InstanceCreatorContext, error: MnemonicaError) => void;
export {};
