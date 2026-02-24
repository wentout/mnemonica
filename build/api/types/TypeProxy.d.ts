import type { constructorOptions, ConstructorFunction } from '../../types';
export interface TypeProxyInstance {
    __type__: {
        [key: string]: unknown;
        proto: object;
        subtypes: Map<string, unknown>;
        define: (n: string, c: CallableFunction, cf?: object, ...fa: unknown[]) => unknown;
    };
    Uranus: unknown;
    get(target: CallableFunction, prop: string): unknown;
    set(target: unknown, name: string, value: unknown): boolean;
    construct(target: unknown, args: unknown[]): object;
    apply: typeof subTypeApply;
    new (...args: unknown[]): object;
}
export declare const TypeProxy: ConstructorFunction<TypeProxyInstance>;
declare const subTypeApply: (parentType: {
    define: (n: string, c: CallableFunction, cf?: object, ...fa: unknown[]) => unknown;
}, cfg?: constructorOptions, ...fnArgs: unknown[]) => <T extends {
    new (): unknown;
}>(cstr: T) => T;
export {};
