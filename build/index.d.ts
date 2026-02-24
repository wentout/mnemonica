import type { CreateTypesCollectionFunction, IDEF, hook, hooksTypes, constructorOptions, Proto, Constructor, DecoratedClass, TypeClass, TypeAbsorber } from './types';
export declare const isClass: (fn: CallableFunction) => boolean, findSubTypeFromParent: (instance: import("./api/utils/index").parentSub | object | undefined, subType: string) => import("./api/utils/index").parentSub | null;
export type { IDEF, ConstructorFunction } from './types';
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: object;
export declare const define: TypeAbsorber;
export declare const lookup: (this: unknown, TypeNestedPath: string) => TypeClass | undefined;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
export declare const registerHook: <T extends object>(Ctor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const _define: (this: CallableFunction, subtypes: Map<string, object>, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => TypeClass, _lookup: (this: Map<string, object>, TypeNestedPath: string) => TypeClass | undefined;
export declare const SymbolParentType: unknown, SymbolConstructorName: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown;
export declare const createTypesCollection: CreateTypesCollectionFunction;
export declare const defaultCollection: Map<string, object>;
export declare const errors: {
    [index: string]: import("./types").MnemonicaErrorConstructor;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
