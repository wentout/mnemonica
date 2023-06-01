import { ITypeClass, TypeLookup, IDEF } from './types';
export type { IDEF } from './types';
export declare const defaultTypes: any;
type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
interface IDefinitor<P, IN extends string> {
    <T, M extends Proto<P, T>, S extends Record<IN, new () => unknown> & M>(this: unknown, TypeName: IN, constructHandler: IDEF<T>, proto?: P, config?: object): {
        new (): {
            [key in keyof S]: S[key];
        };
        define: IDefinitor<M, IN>;
    };
}
export declare const define: <T, P extends object, N extends Proto<P, T>, ID extends string, S extends Record<ID, new () => unknown> & N>(this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: P | undefined, config?: {}) => {
    new (): { [key in keyof S]: S[key]; };
    define: IDefinitor<N, ID>;
};
export declare const tsdefine: <T>(this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: object, config?: object) => ITypeClass<T>;
export declare const lookup: TypeLookup;
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolSubtypeCollection: unknown, SymbolConstructorName: unknown, SymbolGaia: unknown, SymbolReplaceGaia: unknown, SymbolDefaultNamespace: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, GAIA: unknown, URANUS: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createNamespace: unknown, namespaces: unknown, defaultNamespace: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
