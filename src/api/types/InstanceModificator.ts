'use strict';

import { proceedProto } from './InstanceCreatorProto';

export const makeInstanceModificator = ( self: any ) => {

	const {
		ModificationConstructor,
		existentInstance,
		ModificatorType,
		proto,
	} = self;

	return ModificationConstructor.call(
		existentInstance,
		ModificatorType,
		Object.assign( {}, proto ),
		// tslint:disable-next-line: variable-name
		( __proto_proto__: any ) => {
			self.__proto_proto__ = __proto_proto__;
			proceedProto.call( self );
		}
	);
};
