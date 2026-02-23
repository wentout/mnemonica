import { TypeLookup, IDEF, hook, hooksTypes, constructorOptions, Proto, SN, IDefinitorInstance, Constructor, DecoratedClass } from './types';
export declare const isClass: (fn: CallableFunction) => boolean, findSubTypeFromParent: (instance: import("./api/utils/index").parentSub | object | undefined, subType: string) => import("./api/utils/index").parentSub | null;
export type { IDEF, ConstructorFunction } from './types';
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: any;
export declare const define: <T extends object, P extends object, N extends Proto<P, T>, S extends SN & N, R extends IDefinitorInstance<N, S>>(this: unknown, TypeName?: string, constructHandler?: IDEF<T>, config?: constructorOptions) => R;
export declare const lookup: TypeLookup;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Ctor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const decorate: <T extends Constructor<object> | constructorOptions | undefined = undefined>(target?: T, config?: constructorOptions) => <U extends Constructor<object>>(cstr: U) => DecoratedClass<U>;
export declare const registerHook: <T extends object>(Ctor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolParentType: unknown, SymbolConstructorName: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: {
    [index: string]: any;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
