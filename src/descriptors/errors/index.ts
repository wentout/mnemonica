'use strict';

import { constants } from '../../constants';
import { BASE_MNEMONICA_ERROR, constructError } from '../../api/errors';

const {
	ErrorMessages,
} = constants;

export const ErrorsTypes: { [ index: string ]: any } = {
	BASE_MNEMONICA_ERROR
};

Object.entries( ErrorMessages ).forEach( entry => {
	const [ ErrorConstructorName, message ] = entry;
	const ErrorConstructor: InstanceType<any> = constructError( ErrorConstructorName, message );
	ErrorsTypes[ ErrorConstructorName ] = ErrorConstructor;
} );


