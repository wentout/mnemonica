import { TypeLookup, IDEF, hook, hooksTypes, constructorOptions, Proto, SN, IDefinitorInstance } from './types';
export type { IDEF, ConstructorFunction } from './types';
export declare const defaultTypes: any;
export declare const define: <T, P extends object, N extends Proto<P, T>, S extends SN & N, R extends IDefinitorInstance<N, S>>(this: unknown, TypeName?: string, constructHandler?: IDEF<T>, proto?: P, config?: constructorOptions) => R;
export declare const lookup: TypeLookup;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const decorate: (parentClass?: unknown, proto?: object, config?: constructorOptions) => <T extends {
    new (): unknown;
}>(cstr: T, s: ClassDecoratorContext<T>) => T;
export declare const registerHook: <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolParentType: unknown, SymbolConstructorName: unknown, SymbolGaia: unknown, SymbolReplaceUranus: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, GAIA: unknown, URANUS: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: {
    [index: string]: any;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
