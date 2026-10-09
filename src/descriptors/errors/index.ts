'use strict';

import type { MnemonicaErrorConstructor } from '../../types';
import { constants } from '../../constants';
import {
	BASE_MNEMONICA_ERROR, constructError 
} from '../../api/errors';

const { ErrorMessages, } = constants;

// ErrorsTypes is dynamically built - using MnemonicaErrorConstructor to indicate these are constructable
export const ErrorsTypes: { [ index: string ]: MnemonicaErrorConstructor } = {
	// the base class takes the whole message (not an addition) as its
	// first argument — it has no fixed message of its own
	BASE_MNEMONICA_ERROR : BASE_MNEMONICA_ERROR
};

Object.entries( ErrorMessages ).forEach( entry => {
	const [ ErrorConstructorName, message ] = entry;
	 
	const ErrorCtor = constructError(
		ErrorConstructorName,
		message 
	);
	ErrorsTypes[ ErrorConstructorName ] = ErrorCtor;
} );


