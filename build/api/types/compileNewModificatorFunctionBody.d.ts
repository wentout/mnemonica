declare const compileNewModificatorFunctionBody: (FunctionName: string, asClass?: boolean) => (ConstructHandler: CallableFunction, CreationHandler: CallableFunction, SymbolConstructorName: symbol) => unknown;
export default compileNewModificatorFunctionBody;
