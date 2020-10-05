'use strict';

import { constants } from '../../constants';
const {
	SymbolUsed
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	PROTOTYPE_USED_TWICE,
} = ErrorsTypes;

export const obey = ( existentInstance: any, ModificatorType: any ) => {
	let protoConstructor: any = ModificatorType;
	while ( protoConstructor instanceof Function ) {
		if ( Object.prototype.hasOwnProperty.call( protoConstructor, SymbolUsed ) && protoConstructor[SymbolUsed]) {
			const error = new PROTOTYPE_USED_TWICE( `${protoConstructor.name}.prototype > ${ModificatorType.name}` );
			throw error;
		}
		const sample = Reflect.getPrototypeOf( protoConstructor );
		if ( sample instanceof Function ) {
			protoConstructor = sample;
		} else {
			Object.defineProperty( protoConstructor, SymbolUsed, {
				get () {
					return true;
				}
			} );
			break;
		}
	}
	Reflect.setPrototypeOf( protoConstructor, existentInstance.constructor );
};
