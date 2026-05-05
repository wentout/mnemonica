export * as errors from './errors';
export declare const hooks: {
    invokeHook: (this: import("../types").Hookable, hookType: string, opts: import("..").hooksOpts) => Set<unknown>;
    registerHook: (this: import("../types").Hookable, hookType: string, cb: import("../types").HookFunction) => void;
    registerFlowChecker: (this: import("../types").Hookable, cb: () => unknown) => void;
};
export declare const types: {
    define: (this: CallableFunction, subtypes: import("./types").TypesMap, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => import("../types").TypeClass;
    lookup: (this: import("./types").TypesMap, TypeNestedPath: string) => import("../types").TypeClass | undefined;
};
