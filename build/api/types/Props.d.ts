import type { CollectionDef, TypeDef, Props as PropsType } from '../../types';
export declare const _addProps: (this: any) => any;
export declare const _getProps: (instance: object, base?: object) => PropsType | undefined;
export declare const _setSelf: (instance: object) => void;
export declare const getProps: (instance: object) => PropsType | undefined;
export declare const setProps: (instance: object, _values: object) => string[] | false;
export type { CollectionDef, TypeDef, PropsType as Props };
