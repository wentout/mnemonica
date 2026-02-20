import { TypeLookup, IDEF, hook, hooksTypes, constructorOptions, Proto, SN, IDefinitorInstance } from './types';
export type { IDEF, ConstructorFunction } from './types';
export { getProps, setProps } from './api/types/Props';
export declare const defaultTypes: any;
export declare const define: <T, P extends object, N extends Proto<P, T>, S extends SN & N, R extends IDefinitorInstance<N, S>>(this: unknown, TypeName?: string, constructHandler?: IDEF<T>, config?: constructorOptions) => R;
export declare const lookup: TypeLookup;
export declare const apply: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, args?: unknown[]) => { [key in keyof S]: S[key]; };
export declare const call: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>, ...args: unknown[]) => { [key in keyof S]: S[key]; };
export declare const bind: <E extends object, T extends object, S extends Proto<E, T>>(entity: E, Constructor: IDEF<T>) => (...args: unknown[]) => { [key in keyof S]: S[key]; };
type Constructor<T = unknown> = new (...args: unknown[]) => T;
type ClassDecorator<T = unknown> = (target: Constructor<unknown>) => Constructor<T> | void;
interface CallableClassWithDecoratorFactory<C> {
    new (...args: unknown[]): C;
    <T>(target?: Constructor<T>): ClassDecorator<T>;
}
export declare const decorate: (parentClass?: {
    new (): unknown;
} | constructorOptions | undefined, config?: constructorOptions) => <T extends Constructor<unknown>, R extends CallableClassWithDecoratorFactory<InstanceType<T>> & T>(cstr: T) => R;
export declare const registerHook: <T extends object>(Constructor: IDEF<T>, hookType: hooksTypes, cb: hook) => void;
export declare const mnemonica: {
    [index: string]: unknown;
};
export declare const SymbolParentType: unknown, SymbolConstructorName: unknown, SymbolDefaultTypesCollection: unknown, SymbolConfig: unknown, MNEMONICA: unknown, MNEMOSYNE: unknown, TYPE_TITLE_PREFIX: unknown, ErrorMessages: unknown, createTypesCollection: unknown;
export declare const defaultCollection: any;
export declare const errors: {
    [index: string]: any;
};
export { utils } from './utils';
export { defineStackCleaner } from './utils';
