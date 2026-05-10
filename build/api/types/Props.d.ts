import type { CollectionDef, InstanceCreatorContext, Props as PropsType, TypeDef } from '../../types';
export declare const _addProps: (this: InstanceCreatorContext) => void;
export declare const _getProps: (instance: object, base?: object) => PropsType | undefined;
export declare const _setSelf: (instance: object) => void;
export declare const getProps: (instance: object) => PropsType | undefined;
export declare const setProps: (instance: object, _values: object) => string[] | false;
export type { CollectionDef, TypeDef, PropsType as Props };
