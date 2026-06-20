export type PropsType = Record<string, unknown>;
export type IDEF<T, Args extends unknown[] = unknown[]> = {
    new (): T;
} | {
    (this: T, ...args: Args): void;
};
export type ErrorMessageKey = 'BASE_ERROR_MESSAGE' | 'HANDLER_MUST_BE_A_FUNCTION' | 'WRONG_TYPE_DEFINITION' | 'WRONG_INSTANCE_INVOCATION' | 'WRONG_MODIFICATION_PATTERN' | 'ALREADY_DECLARED' | 'WRONG_ARGUMENTS_USED' | 'WRONG_HOOK_TYPE' | 'MISSING_HOOK_CALLBACK' | 'MISSING_CALLBACK_ARGUMENT' | 'OPTIONS_ERROR' | 'WRONG_STACK_CLEANER';
export type ErrorMessages = Record<ErrorMessageKey, string>;
export interface hook extends CallableFunction {
    (opts: hooksOpts): unknown;
}
export interface MnemonicaErrorConstructor {
    new (addition?: string, stack?: string | string[]): Error;
    (name: string): Error;
    prototype: {
        constructor: MnemonicaErrorConstructor;
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
export type TypeConstructor<ConstructorInstance extends object> = _Internal_TC_<ConstructorInstance>;
export interface TypeConstructorBase {
    new (...args: unknown[]): object;
}
export interface TypeRegistry {
}
export type InstanceOfTypeRegistry<K extends keyof TypeRegistry> = TypeRegistry[K] extends new (...args: unknown[]) => infer R ? R : never;
export type LiteralKeysOf<T> = keyof T extends infer K ? K extends string ? string extends K ? never : K : never : never;
export type ParentPath<K extends string> = K extends `${infer P}.${string}` ? P : never;
export type ChildKeysOf<P extends string> = {
    [K in keyof TypeRegistry]: K extends `${P}.${string}` ? K : never;
}[keyof TypeRegistry];
export type PathOfInstance<T extends object> = {
    [K in LiteralKeysOf<TypeRegistry>]: TypeRegistry[K] extends new (...args: unknown[]) => infer R ? T extends R ? K : never : never;
}[LiteralKeysOf<TypeRegistry>];
export type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';
export type hooksOpts<P = object, T = P> = {
    TypeName: string;
    type: TypeDef;
    args: unknown[];
    existentInstance: P;
    inheritedInstance?: T;
    creator?: {
        throwModificationError(error: Error): void;
    };
};
export interface AddPropsCallback extends CallableFunction {
    (proto: object): void;
}
export interface ModificationConstructor extends CallableFunction {
    (this: object, ModificatorType: MnemonicaConstructor, ModificatorTypePrototype: object, _addProps: AddPropsCallback): MnemonicaConstructor;
}
export interface ModificationConstructorFactory extends CallableFunction {
    (): ModificationConstructor;
}
export interface MnemonicaConstructorFactory extends CallableFunction {
    (): MnemonicaConstructor;
}
export interface StackBoundary extends CallableFunction {
}
export interface WrappableMethod extends CallableFunction {
}
export type constructorOptions = {
    ModificationConstructor?: ModificationConstructorFactory;
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
    config: constructorOptions;
    parentType?: TypeDef;
    constructHandler: MnemonicaConstructorFactory;
    title: string;
    hooks: Record<string, Set<hook>>;
    invokeHook: (hookType: hooksTypes, opts: hooksOpts) => Set<unknown>;
    prototype: unknown;
    stack?: string;
    [Symbol.hasInstance]: (instance: object) => boolean;
};
export type CollectionDef = Hookable & {
    define: TypeAbsorber;
    lookup: TypeLookup;
    subtypes: SubtypesMap;
    [key: string]: unknown;
};
export interface TypeLookup extends CallableFunction {
    (this: Map<string, unknown>, TypeNestedPath: string): TypeClass | undefined;
}
export interface ThenSpec {
    subtype: object;
    args: unknown[];
    name?: string;
}
export interface InstanceCreatorContext {
    type: TypeDef;
    TypeName: string;
    existentInstance: object;
    args: unknown[];
    ModificationConstructor: ModificationConstructor;
    ModificatorType: MnemonicaConstructor;
    InstanceModificator: MnemonicaConstructor;
    inheritedInstance: object | Promise<object>;
    config: constructorOptions;
    proto: object;
    __proto_proto__?: object;
    stack?: string[];
    getExistentAsyncStack(existentInstance: object): unknown;
    postProcessing(continuationOf?: TypeDef): void;
    makeAwaiter(type: TypeDef, then?: ThenSpec): Promise<object>;
    addThen(then: ThenSpec): void;
    invokePreHooks(): void;
    invokePostHooks(): {
        type: Set<unknown>;
        collection: Set<unknown>;
    };
    throwModificationError(error: MnemonicaError): void;
}
export type Proto<P extends object, T extends object> = T & Pick<P, Exclude<keyof P, keyof T>>;
export type ProtoFlat<P extends object, T extends object, L extends Exclude<keyof P, keyof T> = Exclude<keyof P, keyof T>> = {
    [key in keyof T]: T[key];
} & {
    [key in L]: P[key];
};
export type MnemonicaInstanceMethodKeys = 'extract' | 'pick' | 'parent' | 'clone' | 'fork' | 'exception' | 'sibling';
export type Flatten<F> = {
    [key in keyof F]: F[key];
};
export type Extracted<T extends object> = {
    [K in keyof T as K extends string ? (K extends MnemonicaInstanceMethodKeys ? never : K) : never]: T[K];
} & {};
export type Parsed<T extends object> = {
    name: string;
    props: Extracted<T>;
    self: T;
    proto: object;
    joint: Record<string, unknown>;
    parent: object | undefined;
};
export interface SiblingAccessor {
    (SiblingTypeName: string): TypeClass | undefined;
    [key: string]: TypeClass | undefined;
}
export interface MnemonicaInstance<T extends object = object> {
    extract(): Extracted<T>;
    pick<K extends keyof T>(...keys: (K | K[])[]): {
        [P in K]: T[P];
    } & {};
    pick(...keys: string[]): Record<string, unknown>;
    parent(): object | undefined;
    parent(constructorLookupPath: string): object | undefined;
    readonly clone: this;
    fork(...forkArgs: unknown[]): this;
    exception(error: Error, ...args: unknown[]): Error;
    readonly sibling: SiblingAccessor;
}
export type InstanceInternalProps = {
    __proto_proto__: object;
    __args__: unknown[];
    __collection__: CollectionDef;
    __subtypes__: Map<string, object>;
    __type__: TypeDef;
    __parent__: object;
    __stack__?: string;
    __creator__: InstanceCreatorContext;
    __timestamp__: number;
};
export type Props = InstanceInternalProps & {
    __self__: InstanceInternalProps;
    [key: string]: unknown;
};
export type InstanceResult<N extends object> = {
    [K in keyof N]: N[K];
};
export interface IDefinitorInstance<N extends object, R extends InstanceResult<N> = InstanceResult<N>> {
    TypeName: string;
    prototype: N;
    new (...args: unknown[]): R;
    (...args: unknown[]): IDefinitorInstance<R>;
    define<T extends object, F extends Proto<N, T>>(TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction, configOrUndefined?: constructorOptions | CallableFunction | boolean): IDefinitorInstance<F>;
    lookup: TypeLookup;
    registerHook(hookType: hooksTypes, cb: hook): void;
    subtypes: SubtypesMap;
    __type__?: TypeDef;
    collection?: CollectionDef;
}
export interface TypeAbsorber extends CallableFunction {
    <T extends object>(this: unknown, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: IDEF<T> | object | boolean | CallableFunction, configOrUndefined?: constructorOptions | CallableFunction | boolean): IDefinitorInstance<T>;
}
export interface TypesCollection extends Hookable {
    define: TypeAbsorber;
    lookup: TypeLookup;
    subtypes: SubtypesMap;
    [key: string]: unknown;
}
export interface Hookable {
    hooks: Record<string, Set<hook>>;
    invokeHook(hookType: hooksTypes, opts: hooksOpts): Set<unknown>;
    registerHook(hookType: hooksTypes, cb: hook): void;
    registerFlowChecker(cb: (opts: object) => unknown): void;
}
export type CreateTypesCollectionFunction = (config?: constructorOptions) => TypesCollection;
export type TypeClass = IDefinitorInstance<object>;
export interface MnemonicaConstructor extends NewableFunction {
    new (...args: unknown[]): object;
    (this: object, ...args: unknown[]): unknown;
    [key: symbol]: unknown;
}
export interface TypeDescriptorDefine extends CallableFunction {
    (TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object): TypeClass;
}
export interface TypeDescriptorLookup extends CallableFunction {
    (TypeNestedPath: string): TypeClass | undefined;
}
export type TypeDescriptorInstance = {
    define: TypeDescriptorDefine;
    lookup: TypeDescriptorLookup;
    subtypes: Map<string, object>;
    TypeName: string;
};
export type Constructor<T = object> = new (...args: unknown[]) => T;
export type DecoratedClass<T extends Constructor<object>> = T & (<U extends Constructor<object>>(target: U) => DecoratedClass<U>) & {
    define: TypeAbsorber;
    registerHook(hookType: hooksTypes, cb: hook): void;
    lookup: TypeLookup;
    TypeName: string;
};
export type Merge<E extends object, T extends object> = {
    [K in keyof T | keyof E as K extends MnemonicaInstanceMethodKeys ? never : K]: K extends keyof T ? T[K] : E[K & keyof E];
};
export interface ApplyFunction extends CallableFunction {
    <E extends object, T extends object>(entity: E, Constructor: IDEF<T>, args?: unknown[]): InstanceResult<Merge<E, T>>;
}
export interface CallFunction extends CallableFunction {
    <E extends object, T extends object>(entity: E, Constructor: IDEF<T>, ...args: unknown[]): InstanceResult<Merge<E, T>>;
}
export interface BindFunction extends CallableFunction {
    <E extends object, T extends object>(entity: E, Constructor: IDEF<T>): (...args: unknown[]) => InstanceResult<Merge<E, T>>;
}
export interface UtilsCollection {
    extract<T extends object>(instance: T): Extracted<T>;
    pick<T extends object, K extends keyof T>(instance: T, ...args: (K | K[])[]): {
        [P in K]: T[P];
    } & {};
    pick<T extends object>(instance: T, ...args: (string | string[])[]): Record<string, unknown>;
    clone<T extends object>(instance: T): T;
    fork<T extends object>(instance: T): (this: object, ...forkArgs: unknown[]) => T;
    sibling(instance: object): SiblingAccessor;
    collectConstructors: (instance: object, flat?: boolean) => (CallableFunction | string)[];
    merge<A extends object, B extends object>(a: A, b: B, ...args: unknown[]): InstanceResult<Merge<B, A>>;
    parse<T extends object>(self: T): Parsed<T>;
    parent<T extends object>(instance: T, path?: string): object | undefined;
    parentTyped<P extends keyof TypeRegistry>(instance: InstanceOfTypeRegistry<ChildKeysOf<P & string>>, path: P): InstanceOfTypeRegistry<P> | undefined;
    toJSON<T extends object>(instance: T): string;
    [key: string]: CallableFunction;
}
export interface MnemonicaModule {
    define: TypeAbsorber;
    lookup: (TypeNestedPath: string) => TypeClass | undefined;
    apply: ApplyFunction;
    call: CallFunction;
    bind: BindFunction;
    decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
    registerHook: <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
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
    SymbolParentType: symbol;
    SymbolConstructorName: symbol;
    SymbolDefaultTypesCollection: symbol;
    SymbolConfig: symbol;
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
