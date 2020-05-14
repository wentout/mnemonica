import { ConstructorFunction } from './ConstructorFunction';
export declare type TypeModificator<T extends object> = (...args: any[]) => ConstructorFunction<T>;
