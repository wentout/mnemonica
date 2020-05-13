export declare const defaultTypes: any;
declare function definer(this: object, TypeModificatorClass: Function, config: object): any;
declare function definer(this: object, TypeModificatorFunction: Function, proto: object, config: object): any;
declare function definer(this: object, TypeName: string, TypeModificatortHandler: Function, proto: object, config: object): any;
declare function definer(this: object, TypeName: string, TypeModificatortHandler: Function, proto: object, config: object): any;
declare function lookuper(this: typeof defaultTypes, TypeNestedPath: string): any;
export declare const define: typeof definer;
export declare const lookup: typeof lookuper;
export declare const mnemonica: {
    [index: string]: any;
};
export declare const SymbolSubtypeCollection: any, SymbolConstructorName: any, SymbolGaia: any, SymbolReplaceGaia: any, SymbolDefaultNamespace: any, SymbolDefaultTypesCollection: any, SymbolConfig: any, MNEMONICA: any, MNEMOSYNE: any, GAIA: any, URANUS: any, TYPE_TITLE_PREFIX: any, ErrorMessages: any, createNamespace: any, namespaces: any, defaultNamespace: any, createTypesCollection: any;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
