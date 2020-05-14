'use strict';

export interface ConstructorFunction<ConstructorInstance extends object> {
	new( ...args: any[] ): ConstructorInstance;
	( this: ConstructorInstance, ...args: any[] ): ConstructorInstance;
	prototype: ConstructorInstance;
}
