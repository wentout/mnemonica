import { TypeLookup, IDEF } from './types';
export type { IDEF } from './types';
export declare const defaultTypes: any;
type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
type RN = Record<string | symbol, unknown>;
type SN = Record<string, new () => unknown>;
interface IDefinitorInstance<N extends RN, S> {
    new (): {
        [key in keyof S]: S[key];
    };
    define: IDefinitor<N, string>;
}
interface IDefinitor<P extends RN, SubTypeName extends string> {
    <PP extends object, T extends RN, M extends Proto<P, Proto<PP, T>>, S extends SN & M>(this: unknown, TypeName: SubTypeName, constructHandler: IDEF<T>, proto?: PP, config?: object): IDefinitorInstance<M, S>;
}
export declare const define: <T extends RN, P extends object, N extends Proto<P, T>, SubTypeName extends string, S extends SN & N, R extends {
    new (): { [key in keyof S]: S[key]; };
    define: IDefinitor<N, SubTypeName>;
}>(this: unknown, TypeName?: string, constructHandler?: IDEF<T> | undefined, proto?: P | undefined, config?: {}) => R;
export declare const lookup: TypeLookup;
export declare const apply: <E extends RN, T extends RN, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends RN, T extends RN, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends RN, T extends RN, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolSubtypeCollection: unknown, SymbolConstructorName: unknown, SymbolGaia: unknown, SymbolReplaceGaia: unknown, SymbolDefaultNamespace: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, GAIA: unknown, URANUS: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createNamespace: unknown, namespaces: unknown, defaultNamespace: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
