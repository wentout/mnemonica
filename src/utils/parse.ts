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

export const parse = ( self: object ) => {

	if ( !self || !( self as { constructor?: CallableFunction } ).constructor ) {
		throw new WRONG_MODIFICATION_PATTERN;
	}

	const proto = Reflect.getPrototypeOf( self ) as object;

	const selfConstructor = ( self as { constructor: { name: string } } ).constructor;
	const protoConstructor = ( proto as { constructor: { name: string } } ).constructor;

	if ( selfConstructor.name.toString() !== protoConstructor.name.toString() ) {
		throw new WRONG_ARGUMENTS_USED( `have to use "instance" itself: '${selfConstructor.name}' vs '${protoConstructor.name}'` );
	}

	const protoProto: unknown = Reflect.getPrototypeOf( proto );
	if ( protoProto ) {
		const protoProtoConstructor = ( protoProto as { constructor?: { name: string } } ).constructor;
		if ( protoProtoConstructor && protoConstructor.name.toString() !== protoProtoConstructor.name.toString() ) {
			throw new WRONG_ARGUMENTS_USED( `have to use "instance" itself: '${protoConstructor.name}' vs '${protoProtoConstructor.name}'` );
		}
	}

	// const args = self[SymbolConstructorName] ?
	// self[SymbolConstructorName].args : [];

	const { name } = protoConstructor;

	const props = extract( { ...self } as Record<string, unknown> );
	// props.constructor = undefined;
	delete ( props as { constructor?: unknown } ).constructor;

	const joint = extract( Object.assign( {}, proto ) as Record<string, unknown> );
	delete ( joint as { constructor?: unknown } ).constructor;

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
