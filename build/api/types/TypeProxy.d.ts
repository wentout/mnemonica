import type { constructorOptions, _Internal_TC_, TypeDef, TypeDescriptorDefine } from '../../types';
interface TypeProxyType extends TypeDef {
    define: TypeDescriptorDefine;
    [key: string]: unknown;
}
interface TypeProxyGetHandler {
    get(target: _Internal_TC_<object>, prop: string): unknown;
}
interface TypeProxySetHandler {
    set(_target: unknown, name: string, value: unknown): boolean;
}
interface TypeProxyConstructHandler {
    construct(_target: unknown, args: unknown[]): object;
}
export interface TypeProxyInstance extends TypeProxyGetHandler, TypeProxySetHandler, TypeProxyConstructHandler {
    __type__: TypeProxyType;
    Uranus: unknown;
    apply: typeof subTypeApply;
    new (...args: unknown[]): object;
}
export declare const TypeProxy: _Internal_TC_<TypeProxyInstance>;
declare const subTypeApply: (parentType: TypeProxyType, cfg?: constructorOptions) => <T extends {
    new (): unknown;
}>(cstr: T) => T;
export {};
