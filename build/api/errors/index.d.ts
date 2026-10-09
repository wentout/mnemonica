import type { StackBoundary, MnemonicaErrorConstructor } from '../../types';
declare const SymbolConstructorName: symbol;
export declare const stackCleaners: RegExp[];
export interface StackableInstance {
    stack?: string | string[];
}
export declare const cleanupStack: (stack: string[]) => string[];
export declare const getStack: (this: StackableInstance, title: string, stackAddition: string[], tillFunction?: StackBoundary) => string[];
export declare class BASE_MNEMONICA_ERROR extends Error {
    static [SymbolConstructorName]: String;
    constructor(message?: string, additionalStack?: string[]);
}
export declare const constructError: (name: string, message: string) => MnemonicaErrorConstructor;
export {};
