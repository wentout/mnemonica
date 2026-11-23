import type { CreateTypesCollectionFunction, CtorParameter, IDEF, hooksTypes, constructorOptions, Proto, IDefinitorInstance, Constructor, DecoratedClass, TypeClass, MnemonicaModule, InstanceResult, Merge, GlobalRegistry, FreeLookupResult, typedHook, HookableConstructor, DefineNewableOrCallable, LazyDef, ApplyFunction } from './types';
export declare const isClass: (fn: import("./api/types/compileNewModificatorFunctionBody").ConstructHandler) => fn is import("./api/types/compileNewModificatorFunctionBody").ConstructHandler & import("./api/types/compileNewModificatorFunctionBody").ClassConstructHandler, findSubTypeFromParent: (instance: import("./api/utils/index").parentSub | object | undefined, subType: string) => TypeClass | null;
export type { CtorParameter, IDEF, LazyDef, TypeConstructor, TypeConstructorBase, AnyConstructor, Proto, ProtoFlat, constructorOptions, deliveredHookOpts, hooksOpts, hook, hooksTypes, IDefinitorInstance, InstanceResult, Merge, Constructor, DecoratedClass, TypeClass, TypeAbsorber, TypesCollection, TypeLookup, LookupResult, FreeLookupResult, RegistryOf, MnemonicaModule, RegistryEntry, AsyncRegistryEntry, LookedUpConstructor, LookedUpInstance, typedHook, typedHookOpts, WithHookRegister, HookableConstructor, CreationError, ErrorProps, } from './types';
export interface TypeRegistry {
}
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: import("./types").TypesCollection<{}, object, "">;
export declare function define<T extends object, Args extends unknown[] = unknown[]>(this: unknown, TypeName?: string | IDEF<T, Args>, constructHandler?: IDEF<T, Args>, config?: constructorOptions): IDefinitorInstance<T, InstanceResult<T>, GlobalRegistry, '', object, Args>;
export declare function define<T extends object, P extends object = object, N extends Proto<P, T> = Proto<P, T>, R extends IDefinitorInstance<N, InstanceResult<N>, GlobalRegistry, '', object, never[]> = IDefinitorInstance<N>>(this: unknown, TypeName?: string | DefineNewableOrCallable, constructHandler?: IDEF<T> | DefineNewableOrCallable | object | boolean, config?: constructorOptions): R;
export declare function lazy<T extends object, Args extends unknown[] = unknown[]>(this: unknown, TypeName: string, getter: LazyDef<T, Args>, config?: constructorOptions): IDefinitorInstance<T, InstanceResult<T>, GlobalRegistry, '', object, Args>;
export declare function lookup<const K extends keyof TypeRegistry>(this: unknown, TypeNestedPath: K): FreeLookupResult<K>;
export declare function lookup(this: unknown, TypeNestedPath: string): TypeClass | undefined;
export declare const apply: ApplyFunction;
export declare const call: <E extends object, T extends object, Args extends unknown[]>(entity: E, Ctor: CtorParameter<T, Args>, ...args: NoInfer<Args>) => InstanceResult<Merge<E, T>>;
export declare const bind: <E extends object, T extends object, Args extends unknown[]>(entity: E, Ctor: CtorParameter<T, Args>) => (...args: Args) => InstanceResult<Merge<E, T>>;
export declare const decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
export declare const registerHook: <T extends object, HT extends hooksTypes = hooksTypes>(Ctor: HookableConstructor<T>, hookType: HT, cb: typedHook<HT, object, T>) => void;
export declare const mnemonica: MnemonicaModule;
export declare const SymbolParentType: symbol, SymbolConstructorName: symbol, SymbolDefaultTypesCollection: symbol, SymbolConfig: symbol, MNEMONICA: string, MNEMOSYNE: string, TYPE_TITLE_PREFIX: string, ErrorMessages: import("./types").ErrorMessages;
export declare const createTypesCollection: CreateTypesCollectionFunction;
export declare const defaultCollection: Map<string, object>;
export declare const errors: {
    [index: string]: import("./types").MnemonicaErrorConstructor;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
