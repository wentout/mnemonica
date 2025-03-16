declare const SymbolConstructorName: symbol;
export declare const stackCleaners: RegExp[];
export declare const cleanupStack: (stack: string[]) => string[];
export declare const getStack: (this: any, title: string, stackAddition: string[], tillFunction?: CallableFunction) => any;
export declare class BASE_MNEMONICA_ERROR extends Error {
    static [SymbolConstructorName]: String;
    constructor(message: string | undefined, additionalStack: string[]);
}
export declare const constructError: (name: string, message: string) => {
    prototype: {
        constructor: CallableFunction;
    };
};
export {};
