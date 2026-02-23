export * as errors from './errors';
export declare const hooks: {
    invokeHook: (this: any, hookType: string, opts: {
        [index: string]: any;
    }) => Set<unknown>;
    registerHook: (this: any, hookType: string, cb: CallableFunction) => void;
    registerFlowChecker: (this: any, cb: () => unknown) => void;
};
export declare const types: {
    define: (this: CallableFunction, subtypes: Map<string, object>, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => import("../types").TypeClass;
    lookup: (this: Map<string, object>, TypeNestedPath: string) => import("../types").TypeClass | undefined;
};
