import { TypeClass, DefineNewableOrCallable, LazyDef } from '../../types';
export type TypesMap = Map<string, object> & {};
export declare const define: (this: unknown, subtypes: TypesMap, TypeOrTypeName: string | DefineNewableOrCallable, constructHandlerOrConfig?: DefineNewableOrCallable | object, config?: object) => TypeClass;
export declare const lazy: (this: unknown, subtypes: TypesMap, TypeName: string, getter?: LazyDef<object>, config?: object) => TypeClass;
export declare const lookup: (this: TypesMap, TypeNestedPath: string) => TypeClass | undefined;
