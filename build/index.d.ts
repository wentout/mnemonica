import type { CreateTypesCollectionFunction, IDEF, hook, hooksTypes, constructorOptions, Proto, Constructor, DecoratedClass, TypeClass, TypeAbsorber, MnemonicaModule, InstanceResult, Merge } from './types';
export declare const isClass: (fn: import("./api/types/compileNewModificatorFunctionBody").ConstructHandler) => boolean, findSubTypeFromParent: (instance: import("./api/utils/index").parentSub | object | undefined, subType: string) => import("./api/utils/index").parentSub | null;
export type { IDEF, TypeConstructor, TypeConstructorBase, InstanceOfTypeRegistry, LiteralKeysOf, ParentPath, PathOfInstance, AllParentPrefixes, ParentPathOfInstance, _Internal_TC_, Proto, ProtoFlat, hooksOpts, hook, hooksTypes, TypesCollection } from './types';
export interface TypeRegistry {
}
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: import("./types").TypesCollection;
export declare const define: TypeAbsorber;
export declare function lookup<const K extends keyof TypeRegistry>(this: unknown, TypeNestedPath: K): TypeRegistry[K] | undefined;
export declare function lookup(this: unknown, TypeNestedPath: string): TypeClass | undefined;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, args?: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, ...args: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>) => (...args: unknown[]) => InstanceResult<Merge<E, T>>;
export declare const decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
export declare const registerHook: <T extends Constructor<T>>(Ctor: DecoratedClass<T>, hookType: hooksTypes, cb: hook) => void;
export declare const mnemonica: MnemonicaModule;
export declare const _define: (this: unknown, subtypes: import("./api/types").TypesMap, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => TypeClass, _lookup: (this: import("./api/types").TypesMap, TypeNestedPath: string) => TypeClass | undefined;
export declare const SymbolParentType: symbol, SymbolConstructorName: symbol, SymbolDefaultTypesCollection: symbol, SymbolConfig: symbol, MNEMONICA: string, MNEMOSYNE: string, TYPE_TITLE_PREFIX: string, ErrorMessages: import("./types").ErrorMessages;
export declare const createTypesCollection: CreateTypesCollectionFunction;
export declare const defaultCollection: Map<string, object>;
export declare const errors: {
    [index: string]: import("./types").MnemonicaErrorConstructor;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
