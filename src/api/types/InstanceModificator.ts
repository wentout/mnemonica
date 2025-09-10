'use strict';

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
		( __proto_proto__: any ) => {
			self.__proto_proto__ = __proto_proto__;
			_addProps.call( self );
		}
	);

	return result;
};
