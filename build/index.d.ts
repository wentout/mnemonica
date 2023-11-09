import { TypeLookup, IDEF } from './types';
export type { IDEF } from './types';
export declare const defaultTypes: any;
type hooksTypes = 'preCreation' | 'postCreation' | 'creationError';
type hooksOpts = {
    TypeName: string;
    args: unknown[];
    existentInstance: object;
    inheritedInstance: object;
};
type hook = {
    (opts: hooksOpts): void;
};
type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
type SN = Record<string, new () => unknown>;
interface IDefinitorInstance<N extends object, S> {
    new (): {
        [key in keyof S]: S[key];
    };
    define: IDefinitor<N, string>;
    registerHook: (hookType: hooksTypes, cb: hook) => void;
}
interface IDefinitor<P extends object, SubTypeName extends string> {
    <PP extends object, T, M extends Proto<P, Proto<PP, T>>, S extends SN & M>(this: unknown, TypeName: SubTypeName, constructHandler: IDEF<T>, proto?: PP, config?: object): IDefinitorInstance<M, S>;
}
export declare const define: <T, P extends object, N extends Proto<P, T>, S extends SN & N, R extends IDefinitorInstance<N, S>>(this: unknown, TypeName?: string, constructHandler?: IDEF<T> | undefined, proto?: P | undefined, config?: {}) => R;
export declare const lookup: TypeLookup;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolSubtypeCollection: unknown, SymbolConstructorName: unknown, SymbolGaia: unknown, SymbolReplaceGaia: unknown, SymbolDefaultNamespace: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, GAIA: unknown, URANUS: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createNamespace: unknown, namespaces: unknown, defaultNamespace: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
