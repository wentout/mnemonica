import { ConstructorFunction } from './types';
export { ConstructorFunction } from './types';
export declare const defaultTypes: any;
interface SubType<T extends object> extends ConstructorFunction<T> {
    new (...args: any[]): T;
    (this: T, ...args: any[]): ConstructorFunction<T>;
    prototype: T;
    define: typeof define;
    lookup: typeof lookup;
}
export declare const define: <T extends object, S extends ConstructorFunction<T>>(this: any, TypeName: string, constructHandler: S, proto?: object | undefined, config?: object | undefined) => SubType<InstanceType<S>>;
export declare const lookup: (this: typeof defaultTypes, TypeNestedPath: string) => any;
export declare const mnemonica: {
    [index: string]: any;
};
export declare const SymbolSubtypeCollection: any, SymbolConstructorName: any, SymbolGaia: any, SymbolReplaceGaia: any, SymbolDefaultNamespace: any, SymbolDefaultTypesCollection: any, SymbolConfig: any, MNEMONICA: any, MNEMOSYNE: any, GAIA: any, URANUS: any, TYPE_TITLE_PREFIX: any, ErrorMessages: any, createNamespace: any, namespaces: any, defaultNamespace: any, createTypesCollection: any;
export declare const defaultCollection: any;
export declare const errors: any;
export { utils } from './utils';
export { defineStackCleaner } from './utils';
