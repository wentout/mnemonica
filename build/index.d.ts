export declare const defaultTypes: any;
interface Constructible<T> {
    new (...args: any[]): T;
    prototype: ThisType<T>;
}
export interface IDEF<T extends Constructible<T>> {
    new (...args: any[]): InstanceType<Constructible<T>>;
    (this: T, ...args: any[]): T;
}
interface SubType<T> {
    new (...args: any[]): InstanceType<Constructible<T>>;
    (this: T, ...args: any[]): T;
    define: typeof define;
    lookup: typeof lookup;
    registerHook: (type: string, hook: CallableFunction) => any;
}
export declare const define: <T, S extends Constructible<T>>(this: any, TypeName: string, constructHandler: S, proto?: object | undefined, config?: object | undefined) => SubType<S>;
export declare const lookup: (this: typeof defaultTypes, TypeNestedPath: string) => any;
export declare const mnemonica: {
    [index: string]: any;
};
export declare const SymbolSubtypeCollection: any, SymbolConstructorName: any, SymbolGaia: any, SymbolReplaceGaia: any, SymbolDefaultNamespace: any, SymbolDefaultTypesCollection: any, SymbolConfig: any, MNEMONICA: any, MNEMOSYNE: any, GAIA: any, URANUS: any, TYPE_TITLE_PREFIX: any, ErrorMessages: any, createNamespace: any, namespaces: any, defaultNamespace: any, createTypesCollection: any;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
