declare class BASE_MNEMONICA_ERROR extends Error {
    constructor(message: string | undefined, additionalStack: Array<string>);
}
declare const _default: {
    BASE_MNEMONICA_ERROR: typeof BASE_MNEMONICA_ERROR;
    constructError: (name: string, message: string) => any;
    cleanupStack: (stack: string[]) => string[];
    getStack: (this: any, title: string, stackAddition: string[], tillFunction?: Function | undefined) => any;
    defineStackCleaner: (regexp: RegExp) => void;
};
export default _default;
