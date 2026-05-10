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
type ModificationBody = new (...args: unknown[]) => object;
declare const compileNewModificatorFunctionBody: (FunctionName: string, asClass?: boolean) => (ConstructHandler: ConstructHandler, CreationHandler: CreationHandler, SymbolConstructorName: symbol) => () => ModificationBody;
export default compileNewModificatorFunctionBody;
