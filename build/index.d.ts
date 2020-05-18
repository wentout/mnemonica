export declare const defaultTypes: any;
export interface IDEF<T> {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    prototype: ThisType<T>;
}
interface SubType<T> {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    define: typeof define;
    lookup: typeof lookup;
    registerHook: (type: string, hook: CallableFunction) => any;
}
export declare const define: <T>(this: any, TypeName: string, constructHandler: IDEF<T>, proto?: object | undefined, config?: object | undefined) => SubType<T>;
export declare const lookup: (this: typeof defaultTypes, TypeNestedPath: string) => any;
export declare const mnemonica: {
    [index: string]: any;
};
export declare const SymbolSubtypeCollection: any, SymbolConstructorName: any, SymbolGaia: any, SymbolReplaceGaia: any, SymbolDefaultNamespace: any, SymbolDefaultTypesCollection: any, SymbolConfig: any, MNEMONICA: any, MNEMOSYNE: any, GAIA: any, URANUS: any, TYPE_TITLE_PREFIX: any, ErrorMessages: any, createNamespace: any, namespaces: any, defaultNamespace: any, createTypesCollection: any;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
