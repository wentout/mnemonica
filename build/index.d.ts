import { TypeAbsorber, ITypeClass, TypeLookup, IDEF } from './types';
export type { IDEF } from './types';
export declare const defaultTypes: any;
export declare const define: TypeAbsorber;
export declare const tsdefine: <T>(this: any, TypeName: string, constructHandler: IDEF<T>, proto?: object | undefined, config?: object | undefined) => ITypeClass<T>;
export declare const lookup: TypeLookup;
export declare const mnemonica: {
    [index: string]: any;
};
export declare const SymbolSubtypeCollection: any, SymbolConstructorName: any, SymbolGaia: any, SymbolReplaceGaia: any, SymbolDefaultNamespace: any, SymbolDefaultTypesCollection: any, SymbolConfig: any, MNEMONICA: any, MNEMOSYNE: any, GAIA: any, URANUS: any, TYPE_TITLE_PREFIX: any, ErrorMessages: any, createNamespace: any, namespaces: any, defaultNamespace: any, createTypesCollection: any;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
