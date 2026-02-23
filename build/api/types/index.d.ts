import { TypeClass } from '../../types';
export declare const define: (this: CallableFunction, subtypes: Map<string, object>, TypeOrTypeName: string | CallableFunction, constructHandlerOrConfig?: CallableFunction | object, config?: object) => TypeClass;
export declare const lookup: (this: Map<string, object>, TypeNestedPath: string) => TypeClass | undefined;
