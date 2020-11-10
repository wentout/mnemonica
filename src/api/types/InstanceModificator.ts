'use strict';

import { addProps } from './addProps';

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
		// tslint:disable-next-line: variable-name
		( __proto_proto__: any ) => {
			self.__proto_proto__ = __proto_proto__;
			addProps.call( self );
		}
	);

	return result;
};
