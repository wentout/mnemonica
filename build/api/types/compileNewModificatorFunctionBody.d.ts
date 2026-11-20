export interface ConstructHandler extends CallableFunction {
    (this: object, ...args: unknown[]): unknown;
    prototype: object;
}
export interface ClassConstructHandler extends NewableFunction {
    new (...args: unknown[]): object;
    prototype: object;
}
export interface CreationHandler extends CallableFunction {
    (this: object, answer: unknown): unknown;
}
export interface CallableCandidate extends CallableFunction {
}
export declare const isCallableCandidate: (value: unknown) => value is CallableCandidate;
export declare function classifyConstructHandler(FunctionName: string, handler: CallableCandidate): asserts handler is ConstructHandler;
export declare const isClass: (fn: ConstructHandler) => fn is ConstructHandler & ClassConstructHandler;
type ModificationBody = new (...args: unknown[]) => object;
declare const compileNewModificatorFunctionBody: (FunctionName: string) => (ConstructHandler: ConstructHandler, CreationHandler: CreationHandler, SymbolConstructorName: symbol) => () => ModificationBody;
export default compileNewModificatorFunctionBody;
