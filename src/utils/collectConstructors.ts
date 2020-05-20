'use strict';

import { constants } from '../constants';

const {
	MNEMOSYNE,
	MNEMONICA,
	GAIA,
} = constants;

const getAdditor = ( constructors: string[] | { [ index: string ]: boolean } ) => {
	return Array.isArray( constructors ) ?
		( name: string ) => {
			constructors.push( name );
		} : ( name: string ) => {
			constructors[ name ] = true;
		};

};

const getAccumulator = ( asSequence: boolean ) => {
	return asSequence ? [] : {}
};

export const collectConstructors = ( self: object, asSequence = false ) => {

	const constructors = getAccumulator( asSequence );
	const addToSequence = getAdditor( constructors );

	if ( typeof self === 'object' ) {
		if ( self === null ) {
			return constructors;
		}
	} else {
		return constructors;
	}

	let proto: any = Reflect.getPrototypeOf( self );
	let mnemonicaReached = false;
	while ( proto ) {
		const constructorName = proto.constructor.name;
		if ( constructorName === GAIA ) {
			self = proto;
			proto = Reflect.getPrototypeOf( self );
			continue;
		}
		if ( constructorName === MNEMONICA ) {
			if ( !mnemonicaReached ) {
				addToSequence( constructorName );
				addToSequence( MNEMOSYNE );
				mnemonicaReached = true;
			}
		} else if ( constructorName === 'Object' ) {
			addToSequence( constructorName );
			break;
		} else {
			addToSequence( constructorName );
		}
		self = proto;
		proto = Reflect.getPrototypeOf( self );
	}
	return constructors;
};
