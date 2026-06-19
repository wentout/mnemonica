'use strict';

import { extract } from './extract';
export const toJSON = <T extends object>( instance: T ) => {

	const extracted = extract( instance );
	const result = Object.entries( extracted ).reduce(
		( o: string, entry: [ string, unknown ] ) => {

			const [ name, _value ] = entry;
			if ( [ null, undefined ].includes( _value as null | undefined ) ) {
				return o;
			}

			let value: string;

			try {
				value = JSON.stringify( _value );
			} catch ( error: unknown ) {
				const description = 'This value type is not supported by JSON.stringify';
				const {
					stack,
					message
				} = error as Error;

				value = JSON.stringify( {
					description,
					stack,
					message
				} );
			}

			o += `"${name}":${value},`;
			return o;

		},
		'{' 
	)
		.replace(
			/,$/,
			'}' 
		);
	return result;

};
