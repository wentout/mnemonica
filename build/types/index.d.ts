export interface ConstructorFunction<ConstructorInstance extends object> {
    new (...args: any[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: any[]): ConstructorInstance;
    prototype: ConstructorInstance;
}
export declare type TypeModificator<T extends object> = (...args: any[]) => ConstructorFunction<T>;
export declare type TypeLookup = (this: Map<string, any>, TypeNestedPath: string) => TypeClass<object>;
export declare type IDEF<T> = {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    prototype?: ThisType<T>;
};
declare type TypeAbsorber<T> = (this: any, TypeName: string, constructHandler: IDEF<T>, proto?: object, config?: object) => TypeClass<T>;
export interface TypeClass<T> {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    define: TypeAbsorber<T>;
    lookup: TypeLookup;
    registerHook: (type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction) => any;
}
export {};
