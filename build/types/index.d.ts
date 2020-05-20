export interface ConstructorFunction<ConstructorInstance extends object> {
    new (...args: any[]): ConstructorInstance;
    (this: ConstructorInstance, ...args: any[]): ConstructorInstance;
    prototype: ConstructorInstance;
}
export declare type TypeModificator<T extends object> = (...args: any[]) => ConstructorFunction<T>;
export declare type TypeLookup = (this: Map<string, any>, TypeNestedPath: string) => TypeClass;
export declare type TypeClass = {
    new (...args: any[]): any;
    define: TypeAbsorber;
    lookup: TypeLookup;
    registerHook: (type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction) => any;
};
export declare type TypeAbsorber = (this: any, TypeName: string, constructHandler: NewableFunction, proto?: object, config?: object) => TypeClass;
export declare type IDEF<T> = {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    prototype?: ThisType<T>;
};
export declare type ITypeAbsorber<T> = (this: any, TypeName: string, constructHandler: IDEF<T>, proto?: object, config?: object) => ITypeClass<T>;
export interface ITypeClass<T> {
    new (...args: any[]): T;
    (this: T, ...args: any[]): T;
    define: ITypeAbsorber<T>;
    lookup: TypeLookup;
    registerHook: (type: 'preCreation' | 'postCreation' | 'creationError', hook: CallableFunction) => any;
}
