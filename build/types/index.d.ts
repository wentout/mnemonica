export interface ConstructorFunction<ConstructorInstance extends object> {
    new (...args: any[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: any[]): ConstructorInstance;
    prototype: ConstructorInstance;
}
export declare type TypeModificator<T extends object> = (...args: any[]) => ConstructorFunction<T>;
