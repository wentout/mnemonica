import type { constructorOptions, ConstructorFunction } from '../../types';
export interface TypeProxyInstance {
    __type__: any;
    Uranus: unknown;
    get(target: any, prop: string): any;
    set(target: any, name: string, value: any): boolean;
    construct(target: any, args: unknown[]): any;
    apply: typeof subTypeApply;
    new (...args: unknown[]): any;
}
export declare const TypeProxy: ConstructorFunction<TypeProxyInstance>;
declare const subTypeApply: (parentType: unknown, config?: constructorOptions, ...args: unknown[]) => <T extends {
    new (): unknown;
}>(cstr: T) => T;
export {};
