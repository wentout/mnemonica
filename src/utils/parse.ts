'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_MODIFICATION_PATTERN,
	WRONG_ARGUMENTS_USED
} = ErrorsTypes;

// import { constants } from '../constants';
// const {
// 	MNEMONICA,
// 	SymbolConstructorName
// } = constants;

import { extract } from './extract';

export const parse = ( self: any ): any => {

	if ( !self || !self.constructor ) {
		throw new WRONG_MODIFICATION_PATTERN;
	}

	const proto = Reflect.getPrototypeOf( self ) as object;

	if ( self.constructor.name.toString() !== proto.constructor.name.toString() ) {
		throw new WRONG_ARGUMENTS_USED( `have to use "instance" itself: '${self.constructor.name}' vs '${proto.constructor.name}'` );
	}

	const protoProto: unknown = Reflect.getPrototypeOf( proto );
	if ( protoProto && proto.constructor.name.toString() !== protoProto.constructor.name.toString() ) {
		throw new WRONG_ARGUMENTS_USED( `have to use "instance" itself: '${proto.constructor.name}' vs '${protoProto.constructor.name}'` );
	}

	// const args = self[SymbolConstructorName] ?
	// self[SymbolConstructorName].args : [];

	const { name } = proto.constructor;

	const props: any = extract( { ...self } );
	// props.constructor = undefined;
	delete props.constructor;

	const joint: any = extract( Object.assign( {}, proto ) );
	delete joint.constructor;

	const parent = protoProto;
	// TODO: deep parse
	// let parent;
	// if ( protoProto[ SymbolConstructorName ] === MNEMONICA ) {
	// 	parent = parse( protoProto );
	// } else {
	// 	parent = Reflect.getPrototypeOf( protoProto );
	// }

	return {

		name,

		props,
		// the line below copy symbols also

		self,
		proto,

		joint,
		// args,
		parent,

	};
};
