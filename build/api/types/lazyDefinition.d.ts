import type { ConstructHandler } from './compileNewModificatorFunctionBody';
export interface LazyDefinitionCell {
    handler: ConstructHandler | undefined;
    asClass: boolean;
    proto: object;
    failed: boolean;
    error: unknown;
}
export interface LazyDefinition {
    cell: LazyDefinitionCell;
    blockErrors: boolean;
    gather: () => void;
    reset: () => void;
}
export declare const setLazyDefinition: (key: object, definition: LazyDefinition) => void;
export declare const readLazyDefinition: (type: unknown) => LazyDefinition | undefined;
export declare const gatherLazyDefinition: (type: unknown, existentInstance?: unknown) => void;
export declare const resetLazyDefinition: (type: unknown) => void;
export declare const readLazyDefinitionFailure: (type: unknown) => {
    failed: boolean;
    error: unknown;
} | undefined;
