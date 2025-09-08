'use strict';

import { ErrorsTypes } from '../../descriptors/errors';
const {
	PROTOTYPE_USED_TWICE,
} = ErrorsTypes;

const used = new WeakSet();

export const obey = ( existentInstance: any, ModificatorType: any ) => {
	let protoConstructor: any = ModificatorType;
	while ( protoConstructor instanceof Function ) {
		if ( used.has(protoConstructor) ) {
			const error = new PROTOTYPE_USED_TWICE( `${protoConstructor.name}.prototype > ${ModificatorType.name}` );
			throw error;
		}
		const sample = Reflect.getPrototypeOf( protoConstructor );
		if ( sample instanceof Function ) {
			protoConstructor = sample;
		} else {
			used.add(protoConstructor);
			break;
		}
	}
	Reflect.setPrototypeOf( protoConstructor, existentInstance.constructor );
};
