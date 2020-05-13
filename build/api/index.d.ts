export * as errors from './errors';
export declare const hooks: {
    invokeHook: (this: any, hookType: string, opts: {
        [index: string]: any;
    }) => Set<unknown>;
    registerHook: (this: any, hookType: string, cb: Function) => void;
    registerFlowChecker: (this: any, cb: Function) => void;
};
export declare const types: {
    define: any;
    lookup: any;
};