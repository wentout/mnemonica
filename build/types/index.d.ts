export type IDEF<T> = {
    new (): T;
} | {
    (this: T, ...args: unknown[]): void;
};
export interface ConstructorFunction<ConstructorInstance extends object> {
    new (...args: unknown[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
    prototype: ConstructorInstance;
}
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';
export type hooksOpts = {
    TypeName?: string;
    type?: TypeDef;
    args: unknown[];
    existentInstance: object;
    inheritedInstance: object;
    creator?: object;
};
export type hook = (opts: hooksOpts) => void;
export type constructorOptions = {
    ModificationConstructor?: CallableFunction;
    strictChain?: boolean;
    blockErrors?: boolean;
    submitStack?: boolean;
    awaitReturn?: boolean;
    asClass?: boolean;
};
export type SubtypesMap = Map<string, TypeClass>;
export type TypeDef = {
    TypeName: string;
    proto: object;
    isSubType: boolean;
    subtypes: SubtypesMap;
    collection: CollectionDef;
    config: {
        strictChain: boolean;
        blockErrors?: boolean;
        submitStack?: boolean;
        awaitReturn?: boolean;
        asClass?: boolean;
        ModificationConstructor?: CallableFunction;
    };
    parentType?: TypeDef;
    constructHandler: () => CallableFunction;
    title: string;
    hooks: Record<string, hook[]>;
    invokeHook: (hookType: hooksTypes, opts: hooksOpts) => void;
    prototype: unknown;
    stack?: string;
};
export type CollectionDef = {
    define: TypeAbsorber;
    lookup: TypeLookup;
    invokeHook: (hookType: hooksTypes, opts: hooksOpts) => void;
    registerHook: (hookType: hooksTypes, cb: hook) => void;
    registerFlowChecker: (cb: () => unknown) => void;
    subtypes: SubtypesMap;
    hooks: Record<string, hook[]>;
    [key: string]: unknown;
};
export type TypeLookup = (this: Map<string, unknown>, TypeNestedPath: string) => TypeClass | undefined;
export type TypeAbsorber = <T extends object, P extends object = object>(this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: P, config?: constructorOptions) => IDefinitorInstance<Proto<P, T>, SN & Proto<P, T>>;
export type Proto<P extends object, T extends object> = Pick<P, Exclude<keyof P, keyof T>> & T;
export type SN = Record<string, IDefinitorInstance<object, object>>;
export type Props = {
    __proto_proto__: object;
    __args__: unknown[];
    __collection__: CollectionDef;
    __subtypes__: Map<string, object>;
    __type__: TypeDef;
    __parent__: object;
    __stack__?: string;
    __creator__: TypeDef;
    __timestamp__: number;
    __self__?: {
        extract: () => Record<string, unknown>;
        pick: (...keys: string[]) => Record<string, unknown>;
        parent: (constructorLookupPath?: string) => object | undefined;
        clone: object;
        fork: (...forkArgs: unknown[]) => object;
        exception: (error: Error, ...args: unknown[]) => Error;
        sibling: SiblingAccessor;
        [key: string]: unknown;
    };
};
export interface SiblingAccessor {
    (SiblingTypeName: string): TypeClass | undefined;
    [key: string]: TypeClass | undefined;
}
export interface MnemonicaInstance {
    extract(): Record<string, unknown>;
    pick(...keys: string[]): Record<string, unknown>;
    pick(keys: string[]): Record<string, unknown>;
    parent(): object | undefined;
    parent(constructorLookupPath: string): object | undefined;
    readonly clone: object;
    fork(...forkArgs: unknown[]): object;
    exception(error: Error, ...args: unknown[]): Error;
    readonly sibling: SiblingAccessor;
    [key: string]: unknown;
}
export interface IDefinitorInstance<N extends object, S = SN> {
    new (...args: unknown[]): N & MnemonicaInstance & S;
    (...args: unknown[]): N & MnemonicaInstance & S;
    define: TypeAbsorber;
    lookup: TypeLookup;
    registerHook(hookType: hooksTypes, cb: hook): void;
    TypeName: string;
    prototype: N;
    subtypes: SubtypesMap;
}
export interface IDefinitor<P extends object, SubTypeName extends string> {
    <PP extends object, T extends object, M extends Proto<P, Proto<PP, T>>, S extends SN & M>(this: unknown, TypeName: SubTypeName, constructHandler: IDEF<T>, proto?: PP, config?: constructorOptions): IDefinitorInstance<M, S>;
}
export type TypeClass = IDefinitorInstance<object, SN>;
export interface ITypeClass<T> {
    new (...args: unknown[]): T;
    (this: T, ...args: unknown[]): T;
    define: ITypeAbsorber<T>;
    lookup: TypeLookup;
    registerHook(hookType: hooksTypes, cb: hook): void;
}
export type ITypeAbsorber<T> = (this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: object, config?: constructorOptions) => ITypeClass<T>;
export type TypeDescriptorInstance = {
    define: CallableFunction;
    lookup: CallableFunction;
    subtypes: object;
};
export type TypeDescriptorConstructor = ConstructorFunction<TypeDescriptorInstance>;
export type TypesCollectionConstructor = ConstructorFunction<object>;
export type Constructor<T = object> = new (...args: unknown[]) => T;
export type DecoratedClass<T extends Constructor<object>> = T & (<U extends Constructor<object>>(target: U) => DecoratedClass<U>) & {
    define: TypeAbsorber;
    registerHook(hookType: hooksTypes, cb: hook): void;
    lookup: TypeLookup;
    TypeName: string;
};
export type ConstructorFactory<T> = () => Constructor<T>;
export type ApplyFunction = <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, args?: unknown[]) => S;
export type CallFunction = <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, ...args: unknown[]) => S;
export type BindFunction = <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>) => (...args: unknown[]) => S;
