import { ITypeClass, TypeLookup, IDEF } from './types';
export type { IDEF } from './types';
export declare const defaultTypes: any;
type Proto<P, T> = Pick<P, Exclude<keyof P, keyof T>> & T;
interface IDefinitor<P, ID extends string> {
    <T, N extends Proto<P, T>>(this: unknown, TypeName: ID, constructHandler: IDEF<T>, proto?: P, config?: object): {
        new (): N & {
            [key in PropertyKey]: {
                new (): unknown;
            };
        };
        define: IDefinitor<N, ID>;
        ID: IDEF<T>;
    };
}
export declare const define: <T, P extends object, N extends Proto<P, T>, ID extends string>(this: unknown, TypeName: string, constructHandler: IDEF<T>, proto?: P | undefined, config?: {}) => {
    new (): N & {
        [x: string]: new () => unknown;
        [x: number]: new () => unknown;
        [x: symbol]: new () => unknown;
    };
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
