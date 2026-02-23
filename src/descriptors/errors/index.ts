'use strict';

import type { MnemonicaErrorConstructor } from '../../types';
import { constants } from '../../constants';
import { BASE_MNEMONICA_ERROR, constructError } from '../../api/errors';

const {
	ErrorMessages,
} = constants;

// ErrorsTypes is dynamically built - using MnemonicaErrorConstructor to indicate these are constructable
export const ErrorsTypes: { [ index: string ]: MnemonicaErrorConstructor } = {
	BASE_MNEMONICA_ERROR : BASE_MNEMONICA_ERROR as unknown as MnemonicaErrorConstructor
};

Object.entries( ErrorMessages ).forEach( entry => {
	const [ ErrorConstructorName, message ] = entry;
	// eslint-disable-next-line no-shadow
	const ErrorCtor = constructError( ErrorConstructorName, message );
	ErrorsTypes[ ErrorConstructorName ] = ErrorCtor as MnemonicaErrorConstructor;
} );


