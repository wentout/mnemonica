export declare const constants: {
    readonly SymbolParentType: symbol;
    readonly SymbolConstructorName: symbol;
    readonly SymbolDefaultTypesCollection: symbol;
    readonly SymbolConfig: symbol;
    readonly MNEMONICA: string;
    readonly MNEMOSYNE: string;
    readonly odp: <T extends object>(o: T, p: PropertyKey, attributes: PropertyDescriptor) => T;
    readonly defaultOptions: Record<string, unknown>;
    readonly defaultOptionsKeys: string[];
    TYPE_TITLE_PREFIX: string;
    ErrorMessages: {
        BASE_ERROR_MESSAGE: string;
        TYPENAME_MUST_BE_A_STRING: string;
        HANDLER_MUST_BE_A_FUNCTION: string;
        WRONG_TYPE_DEFINITION: string;
        WRONG_INSTANCE_INVOCATION: string;
        WRONG_MODIFICATION_PATTERN: string;
        ALREADY_DECLARED: string;
        WRONG_ARGUMENTS_USED: string;
        WRONG_HOOK_TYPE: string;
        MISSING_HOOK_CALLBACK: string;
        MISSING_CALLBACK_ARGUMENT: string;
        FLOW_CHECKER_REDEFINITION: string;
        OPTIONS_ERROR: string;
        WRONG_STACK_CLEANER: string;
    };
};
