export declare const defineStackCleaner: (regexp: RegExp) => void;
export declare const cleanupStack: (stack: Array<string>) => string[];
export declare const getStack: (this: any, title: string, stackAddition: string[], tillFunction?: Function | undefined) => any;
export declare class BASE_MNEMONICA_ERROR extends Error {
    constructor(message: string | undefined, additionalStack: Array<string>);
}
export declare const constructError: (name: string, message: string) => any;
