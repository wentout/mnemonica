import { TypeClass, DefineNewableOrCallable } from '../../types';
export interface LazyTypeGetter extends CallableFunction {
    (): ConstructHandler;
}
import { ConstructHandler } from './compileNewModificatorFunctionBody';
export type TypesMap = Map<string, object> & {};
export declare const define: (this: unknown, subtypes: TypesMap, TypeOrTypeName: string | DefineNewableOrCallable, constructHandlerOrConfig?: DefineNewableOrCallable | object, config?: object) => TypeClass;
export declare const lazy: (this: unknown, subtypes: TypesMap, TypeNameOrGetter: string | LazyTypeGetter | undefined, getterOrConfig?: LazyTypeGetter | object, namedFormConfig?: object) => TypeClass;
export declare const lookup: (this: TypesMap, TypeNestedPath: string) => TypeClass | undefined;
