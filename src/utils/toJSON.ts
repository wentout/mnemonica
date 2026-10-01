'use strict';

import { extract } from './extract';

const descriptionOf = ( error: unknown ) => {
	const {
		stack,
		message
	} = error as Error;
	const description = {
		description : 'This value type is not supported by JSON.stringify',
		stack,
		message
	};
	return description;
};

export const toJSON = <T extends object>( instance: T ) => {

	const extracted = extract( instance );
	// collect the fields into a plain object and stringify ONCE: the output
	// is always valid JSON — keys escaped by the serializer itself, empty
	// field sets become '{}', null/undefined fields omitted
	const collected: Record<string, unknown> = {};
	Object.entries( extracted ).forEach( ( [ name, value ] ) => {
		if ( value === null || value === undefined ) {
			return;
		}
		let checked: unknown;
		try {
			const probe = JSON.stringify( value );
			// stringify returns undefined (no throw) for values JSON has no
			// representation of — functions, symbols: unstringifiable too
			checked = probe === undefined ? descriptionOf( value ) : value;
		} catch ( error: unknown ) {
			checked = descriptionOf( error );
		}
		collected[ name ] = checked;
	} );

	const result = JSON.stringify( collected );
	return result;

};
