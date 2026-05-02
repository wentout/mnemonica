'use strict';

// Step 4 of construction pipeline: bridge between InstanceCreator and ModificationConstructor.
// Called from InstanceCreator after pre-hooks. Delegates to ModificationConstructor
// (see createInstanceModificator.ts) to wire the prototype chain and attach props.

import { _addProps } from './Props';

export const makeInstanceModificator = ( self: any ) => {

	const {
		ModificationConstructor,
		existentInstance,
		ModificatorType,
		proto,
	} = self;

	const result = ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign( {}, proto ),
		( __proto_proto__: unknown ) => {
			self.__proto_proto__ = __proto_proto__;
			_addProps.call( self );
		}
	);

	return result;
};
