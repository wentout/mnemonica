import { TypeClass } from '../../types';
export interface LazyTypeGetter extends CallableFunction {
    (): ConstructHandler;
}
import { ConstructHandler } from './compileNewModificatorFunctionBody';
export type TypesMap = Map<string, object> & {};
export declare const define: (this: unknown, subtypes: TypesMap, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => TypeClass;
export declare const lazy: (this: unknown, subtypes: TypesMap, arg1: string | LazyTypeGetter | undefined, arg2?: LazyTypeGetter | object, arg3?: object) => TypeClass;
export declare const lookup: (this: TypesMap, TypeNestedPath: string) => TypeClass | undefined;
