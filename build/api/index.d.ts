export * as errors from './errors';
export declare const hooks: {
    invokeHook: (this: import("../types").Hookable, hookType: string, opts: import("..").hooksOpts) => Set<unknown>;
    registerHook: (this: import("../types").Hookable, name: string, cb: import("..").hook) => void;
    unregisterHook: (this: import("../types").Hookable, name: string, cb: import("..").hook) => boolean;
    registerFlowChecker: (this: import("../types").Hookable, cb: import("../types").FlowChecker) => void;
};
export declare const types: {
    define: (this: unknown, subtypes: import("./types").TypesMap, TypeOrTypeName: string | import("../types").DefineNewableOrCallable, constructHandlerOrConfig?: import("../types").DefineNewableOrCallable | object | boolean, config?: object | boolean) => import("..").TypeClass;
    lazy: (this: unknown, subtypes: import("./types").TypesMap, TypeName: string, getter?: import("..").LazyDef<object>, config?: object | boolean) => import("..").TypeClass;
    lookup: (this: import("./types").TypesMap, TypeNestedPath: string) => import("..").TypeClass | undefined;
};
