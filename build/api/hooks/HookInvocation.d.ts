import type { hooksOpts, TypeDef } from '../../types';
export declare class HookInvocation {
    private readonly type;
    private readonly TypeName;
    private readonly existentInstance;
    private readonly args;
    private inheritedInstance?;
    private _throwModificationError?;
    constructor(type: TypeDef, existentInstance: object, args: unknown[]);
    withInheritedInstance(instance: object): this;
    withCreator(creator: {
        throwModificationError(error: Error): void;
    }): this;
    build(): hooksOpts;
}
