export declare const addProps: (this: any) => any;
export type CollectionDef = {
    define: CallableFunction;
    lookup: CallableFunction;
    invokeHook: CallableFunction;
    registerHook: CallableFunction;
    registerFlowChecker: CallableFunction;
    subtypes: object;
    hooks: object;
    [key: string]: unknown;
};
export type TypeDef = {
    proto: object;
    collection: CollectionDef;
    invokeHook: CallableFunction;
    config: {
        strictChain: boolean;
    };
    subtypes: Map<string, Props>;
    isSubType: boolean;
    TypeName: string;
    prototype: unknown;
    stack?: string;
};
export type Props = {
    __proto_proto__: object;
    __args__: unknown[];
    __collection__: CollectionDef;
    __subtypes__: Map<string, object>;
    __type__: TypeDef;
    __parent__: Props;
    __stack__?: string;
    __creator__: TypeDef;
    __timestamp__: number;
};
export declare const getProps: (instance: object, base?: object) => Props | undefined;
