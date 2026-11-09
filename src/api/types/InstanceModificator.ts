'use strict';

// Step 4 of construction pipeline: bridge between InstanceCreator and ModificationConstructor.
// Called from InstanceCreator after pre-hooks. Delegates to ModificationConstructor
// (see createInstanceModificator.ts) to wire the prototype chain and attach props.

import type {
	InstanceCreatorContext, MnemonicaConstructor 
} from '../../types';
import { _addProps } from './Props';

export const makeInstanceModificator = ( self: InstanceCreatorContext ): MnemonicaConstructor => {

	const {
		ModificationConstructor,
		existentInstance,
		ModificatorType,
		proto,
		config,
	} = self;

	// Copied by descriptor, never by Object.assign, which invokes getters and
	// freezes them to a value.
	// Class-handler prototypes copy every member: class body methods are
	// non-enumerable, and an enumerable-only copy silently dropped them —
	// Type.define('X', class { m() {} }) lost m on the subtype while lazy
	// kept it. Function-handler prototypes copy the enumerable members only:
	// their non-enumerable props (legacy opt-in instance methods, exception
	// wiring) were never copied, and pins depend on that (exception instances
	// expose no bound methods)
	const ModificatorTypePrototype: { [index: string]: unknown } = {};
	Reflect.ownKeys( proto ).forEach( ( key ) => {
		const descriptor = Reflect.getOwnPropertyDescriptor( proto, key );
		if ( descriptor && ( config.asClass || descriptor.enumerable ) ) {
			Reflect.defineProperty( ModificatorTypePrototype, key, descriptor );
		}
	} );

	const result = ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		ModificatorTypePrototype,
		( __proto_proto__: unknown ) => {
			self.__proto_proto__ = __proto_proto__ as object;
			_addProps.call( self );
		}
	);

	return result;
};
