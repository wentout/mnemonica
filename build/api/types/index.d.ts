import { TypeClass } from '../../types';
export type TypesMap = Map<string, object> & {};
export declare const define: (this: unknown, subtypes: TypesMap, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => TypeClass;
export declare const lookup: (this: TypesMap, TypeNestedPath: string) => TypeClass | undefined;
