'use strict';


import { constants } from './constants';

import * as errorsApi from './api/errors';
import { descriptors } from './descriptors';

export const {
	defaultTypes,
} = descriptors;

const checkThis = function ( pointer: any ): boolean {
	if (
		pointer === mnemonica ||
		pointer === exports
	) {
		return true;
	}
	return false;
};

// define: any = function ( subtypes: any, TypeOrTypeName: string | any, constructHandlerOrConfig: any, proto: object, config: object ) {
function definer ( this: object, TypeModificatorClass: Function, config: object ): any;
function definer ( this: object, TypeModificatorFunction: Function, proto: object, config: object ): any;
function definer ( this: object, TypeName: string, TypeModificatortHandler: Function, proto: object, config: object ): any;
function definer ( this: object, TypeOrTypeName: string | Function, constructHandlerOrConfig: object | Function, proto?: object, config?: object ): any {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.define( TypeOrTypeName, constructHandlerOrConfig, proto, config );
};

function lookuper ( this: typeof defaultTypes, TypeNestedPath: string ) {
	const types = checkThis( this ) ? defaultTypes : this || defaultTypes;
	return types.lookup( TypeNestedPath );
};

export const define = definer;
export const lookup = lookuper;

export const mnemonica = Object.entries( {

	define,
	lookup,

	...descriptors,

	...errorsApi,
	...constants,

} ).reduce( ( acc: { [ index: string ]: any }, entry: any ) => {
	const [ name, code ] = entry;
	Object.defineProperty( acc, name, {
		get () {
			return code;
		},
		enumerable: true
	} );
	return acc;
}, {} );

export const {

	SymbolSubtypeCollection,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceGaia,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	URANUS,
	TYPE_TITLE_PREFIX,
	ErrorMessages,
	createNamespace,
	namespaces,
	defaultNamespace,
	createTypesCollection,

} = mnemonica;


export const defaultCollection = defaultTypes.subtypes;
export const errors = descriptors.ErrorsTypes;

export { utils } from './utils';
export { defineStackCleaner } from './utils';
