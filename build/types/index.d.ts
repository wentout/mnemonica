export type IDEF<T> = {
    new (): T;
} | {
    (this: T, ...args: any[]): void;
};
export interface ConstructorFunction<ConstructorInstance extends object> {
    new (...args: unknown[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
    prototype: ConstructorInstance;
}
export type TypeLookup = (this: Map<string, unknown>, TypeNestedPath: string) => TypeClass;
export type TypeClass = {
    new (...args: unknown[]): unknown;
    define: TypeAbsorber;
    lookup: TypeLookup;
    registerHook: (type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction) => unknown;
};
export type TypeAbsorber = (this: unknown, TypeName: string, constructHandler: CallableFunction, proto?: object, config?: object) => TypeClass;
export type ITypeAbsorber<T> = (this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: object, config?: object) => ITypeClass<T>;
export interface ITypeClass<T> {
    new (...args: unknown[]): T;
    (this: T, ...args: unknown[]): T;
    define: ITypeAbsorber<T>;
    lookup: TypeLookup;
    registerHook: (type: 'preCreation' | 'postCreation' | 'creationError', hookCb: CallableFunction) => unknown;
}
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';
export type hooksOpts = {
    TypeName: string;
    args: unknown[];
    existentInstance: object;
    inheritedInstance: object;
};
export type hook = {
    (opts: hooksOpts): void;
};
export type constructorOptions = {
    ModificationConstructor?: CallableFunction;
    strictChain?: boolean;
    blockErrors?: boolean;
    submitStack?: boolean;
    awaitReturn?: boolean;
};
export type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
export type SN = Record<string, new () => unknown>;
export interface IDefinitorInstance<N extends object, S> {
    new (...arg: unknown[]): {
        [key in keyof S]: S[key];
    } & IDefinitor<N, string>;
    define: IDefinitorInstance<N, string>;
    registerHook: (hookType: hooksTypes, cb: hook) => void;
}
export interface IDefinitor<P extends object, SubTypeName extends string> {
    <PP extends object, T, M extends Proto<P, Proto<PP, T>>, S extends SN & M>(this: unknown, TypeName: SubTypeName, constructHandler: IDEF<T>, proto?: PP, config?: constructorOptions): IDefinitorInstance<M, S>;
}
export type TypeDescriptorInstance = {
    define: CallableFunction;
    lookup: CallableFunction;
    subtypes: object;
};
export type CollectionDef = {
    define: CallableFunction;
    lookup: CallableFunction;
    invokeHook: CallableFunction;
    registerHook: CallableFunction;
    registerFlowChecker: CallableFunction;
    subtypes: object;
    hooks: object;
    [key: string]: unknown;
};
export type TypeDef = {
    proto: object;
    collection: CollectionDef;
    invokeHook: CallableFunction;
    config: {
        strictChain: boolean;
    };
    subtypes: Map<string, Props>;
    isSubType: boolean;
    TypeName: string;
    prototype: unknown;
    stack?: string;
};
export type Props = {
    __proto_proto__: object;
    __args__: unknown[];
    __collection__: CollectionDef;
    __subtypes__: Map<string, object>;
    __type__: TypeDef;
    __parent__: Props;
    __stack__?: string;
    __creator__: TypeDef;
    __timestamp__: number;
    __self__?: {
        extract: CallableFunction;
        [key: string]: unknown;
    };
};
export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type DecoratedClass<T extends Constructor<object>> = T & (<U extends Constructor<object>>(target: U) => DecoratedClass<U>) & {
    define: IDefinitorInstance<InstanceType<T>, unknown>['define'];
    registerHook: IDefinitorInstance<InstanceType<T>, unknown>['registerHook'];
    lookup: TypeLookup;
};
export type TypeDescriptorConstructor = ConstructorFunction<TypeDescriptorInstance>;
export type TypesCollectionConstructor = ConstructorFunction<object>;
