export type PropsType = Record<string, unknown>;
export type IDEF<T> = {
    new (): T;
} | {
    (this: T, ...args: unknown[]): void;
};
export type IDEFWithArgs<T, Args extends unknown[] = unknown[]> = {
    new (): T;
} | {
    (this: T, ...args: Args): void;
};
export type ErrorMessageKey = 'BASE_ERROR_MESSAGE' | 'HANDLER_MUST_BE_A_FUNCTION' | 'WRONG_TYPE_DEFINITION' | 'WRONG_INSTANCE_INVOCATION' | 'WRONG_MODIFICATION_PATTERN' | 'ALREADY_DECLARED' | 'WRONG_ARGUMENTS_USED' | 'WRONG_HOOK_TYPE' | 'MISSING_HOOK_CALLBACK' | 'MISSING_CALLBACK_ARGUMENT' | 'OPTIONS_ERROR' | 'WRONG_STACK_CLEANER';
export type ErrorMessages = Record<ErrorMessageKey, string>;
export interface MnemonicaErrorConstructor {
    new (addition?: string, stack?: string[]): Error;
    (name: string): Error;
    prototype: {
        constructor: CallableFunction;
    };
}
export type ErrorsTypesMap = Record<string, MnemonicaErrorConstructor>;
export interface MnemonicaError extends Error {
    exceptionReason?: Error;
    reasons?: Error[];
    surplus?: Error[];
}
export interface _Internal_TC_<ConstructorInstance extends object> {
    new (...args: unknown[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
    readonly prototype: ConstructorInstance & {
        readonly constructor: _Internal_TC_<ConstructorInstance>;
    };
}
export interface TypeConstructor<ConstructorInstance extends object> {
    new (...args: unknown[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: unknown[]): ConstructorInstance;
    readonly prototype: ConstructorInstance & {
        readonly constructor: TypeConstructor<ConstructorInstance>;
    };
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
    exposeInstanceMethods?: boolean;
};
export type HideInstanceMethodsOptions = constructorOptions & {
    exposeInstanceMethods: true;
};
export type SubtypesMap = Map<string, TypeClass>;
export type TypeDef = {
    TypeName: string;
    proto: object;
    isSubType: boolean;
    subtypes: SubtypesMap;
    collection: CollectionDef;
    config: constructorOptions;
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
export type Proto<P extends object, T extends object> = T & Pick<P, Exclude<keyof P, keyof T>>;
export type ProtoFlat<P extends object, T extends object, L extends Exclude<keyof P, keyof T> = Exclude<keyof P, keyof T>> = {
    [key in keyof T]: T[key];
} & {
    [key in L]: P[key];
};
export type Flatten<F> = {
    [key in keyof F]: F[key];
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
}
export type InstanceSelfProps = InstanceInternalProps & {
    __self__: InstanceInternalProps & MnemonicaInstance;
};
export type Props = InstanceSelfProps & {
    [key: string]: unknown;
};
export type InstanceInternalProps = {
    __proto_proto__: object;
    __args__: unknown[];
    __collection__: CollectionDef;
    __subtypes__: Map<string, object>;
    __type__: TypeDef;
    __parent__: object;
    __stack__?: string;
    __creator__: TypeDef;
    __timestamp__: number;
};
export type IsHidingMethods<Config extends constructorOptions> = Config extends {
    exposeInstanceMethods: false;
} ? true : false;
export type InstanceResult<N extends object, Config extends constructorOptions, R extends Flatten<N> = Flatten<N>, I extends {
    [key in keyof R]: R[key];
} = {
    [key in keyof R]: R[key];
}, M extends I & MnemonicaInstance = I & MnemonicaInstance> = IsHidingMethods<Config> extends true ? R : M;
export interface IDefinitorInstance<N extends object, Config extends constructorOptions = constructorOptions, R extends InstanceResult<N, Config> = InstanceResult<N, Config>> {
    TypeName: string;
    prototype: N;
    new (...args: unknown[]): R;
    (...args: unknown[]): IDefinitorInstance<R, Config>;
    define<T extends object, F extends Proto<N, T>>(TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction, configOrUndefined?: constructorOptions | CallableFunction | boolean): IDefinitorInstance<F, Config>;
    lookup: TypeLookup;
    registerHook(hookType: hooksTypes, cb: hook): void;
    subtypes: SubtypesMap;
    __type__?: TypeDef;
    collection?: CollectionDef;
}
export interface TypeAbsorber {
    <T extends object>(this: unknown, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig: IDEF<T> | object | boolean | CallableFunction, configOrUndefined: HideInstanceMethodsOptions): IDefinitorInstance<T, HideInstanceMethodsOptions>;
    <T extends object>(this: unknown, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction, configOrUndefined?: constructorOptions | CallableFunction | boolean): IDefinitorInstance<T, constructorOptions>;
}
export interface TypesCollection {
    define: TypeAbsorber;
    lookup: TypeLookup;
    registerHook(hookType: hooksTypes, cb: hook): void;
    invokeHook(hookType: hooksTypes, opts: hooksOpts): void;
    registerFlowChecker(cb: () => unknown): void;
    subtypes: SubtypesMap;
    hooks: Record<string, hook[]>;
    [key: string]: unknown;
}
export type CreateTypesCollectionFunction = (config?: constructorOptions) => TypesCollection;
export type TypeClass = IDefinitorInstance<object>;
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
    TypeName: string;
};
export type TypeDescriptorConstructor = TypeConstructor<TypeDescriptorInstance>;
export type TypesCollectionConstructor = TypeConstructor<object>;
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
export interface UtilsCollection {
    extract: (instance: object) => Record<string, unknown>;
    pick: (instance: object, ...args: (string | string[])[]) => Record<string, unknown>;
    collectConstructors: (instance: object, flat?: boolean) => (CallableFunction | string)[];
    merge: (...args: unknown[]) => unknown;
    parse: (value: unknown) => object | undefined;
    parent: (instance: object, strict?: boolean) => object | undefined;
    toJSON: (instance: object) => string;
    [key: string]: CallableFunction;
}
export interface MnemonicaModule {
    define: TypeAbsorber;
    lookup: (TypeNestedPath: string) => TypeClass | undefined;
    apply: ApplyFunction;
    call: CallFunction;
    bind: BindFunction;
    decorate: <U extends Constructor<object>>(target?: object, config?: object) => DecoratedClass<U>;
    registerHook: <T extends object>(Ctor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
    defaultTypes: TypesCollection;
    BASE_MNEMONICA_ERROR: MnemonicaErrorConstructor;
    WRONG_TYPE_DEFINITION: MnemonicaErrorConstructor;
    WRONG_INSTANCE_INVOCATION: MnemonicaErrorConstructor;
    WRONG_MODIFICATION_PATTERN: MnemonicaErrorConstructor;
    ALREADY_DECLARED: MnemonicaErrorConstructor;
    WRONG_ARGUMENTS_USED: MnemonicaErrorConstructor;
    WRONG_HOOK_TYPE: MnemonicaErrorConstructor;
    MISSING_CALLBACK_ARGUMENT: MnemonicaErrorConstructor;
    MISSING_HOOK_CALLBACK: MnemonicaErrorConstructor;
    TYPENAME_MUST_BE_A_STRING: MnemonicaErrorConstructor;
    HANDLER_MUST_BE_A_FUNCTION: MnemonicaErrorConstructor;
    OPTIONS_ERROR: MnemonicaErrorConstructor;
    WRONG_STACK_CLEANER: MnemonicaErrorConstructor;
    MNEMONICA: string;
    MNEMOSYNE: string;
    URANUS: string;
    SymbolParentType: symbol;
    SymbolConstructorName: symbol;
    SymbolDefaultTypesCollection: symbol;
    SymbolConfig: symbol;
    SymbolGaia: symbol;
    TYPE_TITLE_PREFIX: string;
    ErrorMessages: ErrorMessages;
    utils: UtilsCollection;
    getProps: (instance: object) => PropsType | undefined;
    setProps: (instance: object, values: object) => string[] | false;
    findSubTypeFromParent: (instance: object | undefined, subType: string) => object | null;
    isClass: (fn: CallableFunction) => boolean;
    createTypesCollection: CreateTypesCollectionFunction;
    [key: string]: unknown;
}
