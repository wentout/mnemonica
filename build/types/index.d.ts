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
    };
    define: IDefinitor<N, string>;
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
