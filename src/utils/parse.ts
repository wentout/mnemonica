'use strict';

import { ErrorsTypes } from '../descriptors/errors';
const {
	WRONG_MODIFICATION_PATTERN,
	WRONG_ARGUMENTS_USED
} = ErrorsTypes;

import { constants } from '../constants';
const {
	SymbolGaia
} = constants;

import { extract } from './extract';

import { hop } from './hop';

export const parse = ( self: any ): any => {

	if ( !self || !self.constructor ) {
		throw new WRONG_MODIFICATION_PATTERN;
	}

	const proto = Reflect.getPrototypeOf( self ) as object;

	if ( self.constructor.name.toString() !== proto.constructor.name.toString() ) {
		throw new WRONG_ARGUMENTS_USED( `have to use "instance" itself: '${self.constructor.name}' vs '${proto.constructor.name}'` );
	}

	const protoProto: any = Reflect.getPrototypeOf( proto );
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

	let parent;
	let gaia;
	if ( hop( protoProto, SymbolGaia ) ) {
		parent = protoProto;
		// SymbolGaia means we are reached prototype chain root
		gaia = self[ SymbolGaia ];
	} else {
		parent = parse( Reflect.getPrototypeOf( protoProto ) );
		// eslint-disable-next-line prefer-destructuring
		gaia = parent.gaia;
	}

	return {

		name,

		props,
		// the line below copy symbols also

		self,
		proto,

		joint,
		// args,
		parent,
		gaia

	};
};
