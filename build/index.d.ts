import type { CreateTypesCollectionFunction, CtorParameter, IDEF, hooksTypes, constructorOptions, Proto, IDefinitorInstance, Constructor, DecoratedClass, TypeClass, MnemonicaModule, InstanceResult, Merge, TypeLookup, RegistryHolderBase, RegistryEntry, LookedUpConstructor, WithHookRegister, typedHook, HookableConstructor, DefineNewableOrCallable, LookupSource, LazyDef } from './types';
export declare const isClass: (fn: import("./api/types/compileNewModificatorFunctionBody").ConstructHandler) => boolean, findSubTypeFromParent: (instance: import("./api/utils/index").parentSub | object | undefined, subType: string) => import("./api/utils/index").parentSub | null;
export type { CtorParameter, IDEF, LazyDef, TypeConstructor, TypeConstructorBase, AnyConstructor, Proto, ProtoFlat, constructorOptions, hooksOpts, hook, hooksTypes, IDefinitorInstance, InstanceResult, Merge, Constructor, DecoratedClass, TypeClass, TypeAbsorber, TypesCollection, TypeLookup, LookupResult, RegistryOf, MnemonicaModule, RegistryEntry, LookedUpConstructor, LookedUpInstance, typedHook, typedHookOpts, WithHookRegister, HookableConstructor, CreationError, ErrorProps, } from './types';
export interface TypeRegistry {
}
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: import("./types").TypesCollection<{}, object, "">;
export declare function define<Reg extends object, Parent extends object, Path extends string, const Name extends string, N extends object, Args extends unknown[], F extends Proto<Parent, N> = Proto<Parent, N>, ChildPath extends string = Path extends '' ? Name : `${Path}.${Name}`>(source: RegistryHolderBase<Reg, Parent, Path>, TypeName: Name, constructHandler?: IDEF<N, Args>, config?: constructorOptions): IDefinitorInstance<F, InstanceResult<F>, Reg & Record<ChildPath, RegistryEntry<F, ChildPath, Parent>>, ChildPath, Parent>;
export declare function define<T extends object, P extends object = object, N extends Proto<P, T> = Proto<P, T>, R extends IDefinitorInstance<N> = IDefinitorInstance<N>>(this: unknown, TypeName?: string | DefineNewableOrCallable, constructHandler?: IDEF<T> | DefineNewableOrCallable | object | boolean, config?: constructorOptions): R;
export declare function lazy<T extends object>(source: RegistryHolderBase<object, object, string>, TypeName: string, getter: () => IDEF<T>, config?: constructorOptions): IDefinitorInstance<T>;
export declare function lazy<T extends object>(source: RegistryHolderBase<object, object, string>, getter: () => IDEF<T>, config?: constructorOptions): IDefinitorInstance<T>;
export declare function lazy<T extends object>(this: unknown, TypeName: string, getter: LazyDef<T>, config?: constructorOptions): IDefinitorInstance<T>;
export declare function lazy<T extends object>(this: unknown, getter: LazyDef<T>, config?: constructorOptions): IDefinitorInstance<T>;
export declare function lookup<const K extends keyof TypeRegistry>(this: unknown, TypeNestedPath: K): WithHookRegister<TypeRegistry[K]>;
export declare function lookup<Reg extends object, const K extends keyof Reg & string>(source: {
    lookup: TypeLookup<Reg>;
}, TypeNestedPath: K): WithHookRegister<LookedUpConstructor<Reg, K>>;
export declare function lookup(this: unknown, TypeNestedPath: string): TypeClass | undefined;
export declare function lookup(source: LookupSource, TypeNestedPath: string): TypeClass | undefined;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: CtorParameter<T>, args?: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: CtorParameter<T>, ...args: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: CtorParameter<T>) => (...args: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
export declare const registerHook: <T extends object, HT extends hooksTypes = hooksTypes>(Ctor: HookableConstructor<T>, hookType: HT, cb: typedHook<HT, object, T>) => void;
export declare const mnemonica: MnemonicaModule;
export declare const _define: (this: unknown, subtypes: import("./api/types").TypesMap, TypeOrTypeName: string | DefineNewableOrCallable, constructHandlerOrConfig?: DefineNewableOrCallable | object, config?: object) => TypeClass, _lazy: (this: unknown, subtypes: import("./api/types").TypesMap, TypeNameOrGetter: string | import("./api/types").LazyTypeGetter | undefined, getterOrConfig?: import("./api/types").LazyTypeGetter | object, namedFormConfig?: object) => TypeClass, _lookup: (this: import("./api/types").TypesMap, TypeNestedPath: string) => TypeClass | undefined;
export declare const SymbolParentType: symbol, SymbolConstructorName: symbol, SymbolDefaultTypesCollection: symbol, SymbolConfig: symbol, MNEMONICA: string, MNEMOSYNE: string, TYPE_TITLE_PREFIX: string, ErrorMessages: import("./types").ErrorMessages;
export declare const createTypesCollection: CreateTypesCollectionFunction;
export declare const defaultCollection: Map<string, object>;
export declare const errors: {
    [index: string]: import("./types").MnemonicaErrorConstructor;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
