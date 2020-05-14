'use strict';

// 1. init default namespace
// 2. create default namespace in types

import { ConstructorFunction } from '../../types';

import { constants } from '../../constants';
const {
	odp,
	MNEMONICA,
	SymbolDefaultNamespace,
	SymbolConfig,
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	OPTIONS_ERROR,
} = ErrorsTypes;

import * as hooksAPI from '../../api/hooks';

import { descriptors } from '../';

const defaultOptions = {

	// explicit declaration we wish use
	// an old style based constructors
	// e.g. with prototype described with:
	//    createInstanceModificator200XthWay
	// or more general with: createInstanceModificator
	useOldStyle: false,

	// shall or not we use strict checking
	// for creation sub-instances Only from current type
	// or we might use up-nested sub-instances from chain
	strictChain: true,

	// should we use forced errors checking
	// to make all inherited types errored
	// if there is an error somewhere in chain
	// disallow instance construction
	// if there is an error in prototype chain
	blockErrors: true,

	// if it is necessary to collect stack
	// as a __stack__ prototype property
	// during the process of instance creation
	submitStack: false

};

// namespace storage
// name + namespace config
// future feature : path of namespace
// shortcut for ns of module exports
// inter-mediator
const namespaceStorage = new Map();

const Namespace = function ( name: string | symbol, config: object ) {

	if ( typeof config === 'string' ) {
		config = {
			description: config
		};
	}

	if ( !( config instanceof Object ) ) {
		throw new OPTIONS_ERROR;
	}

	const typesCollections = new Map();

	config = Object.assign( {}, defaultOptions, config );

	odp( this, SymbolConfig, {
		get () {
			return config;
		}
	} );

	odp( this, 'name', {
		get () {
			return name;
		},
		enumerable: true
	} );

	odp( this, 'typesCollections', {
		get () {
			return typesCollections;
		},
		enumerable: true
	} );

	const hooks = Object.create( null );
	odp( this, 'hooks', {
		get () {
			return hooks;
		}
	} );

	namespaceStorage.set( name, this );

} as ConstructorFunction<{}>;

Namespace.prototype = {
	createTypesCollection ( association: any, config: object ) {
		const {
			createTypesCollection
		} = descriptors;
		return createTypesCollection( this, association, config );
	},
	...hooksAPI
};

const DEFAULT_NAMESPACE = new Namespace( SymbolDefaultNamespace, {
	description: `default ${MNEMONICA} namespace`
} );


export const namespaces = Object.create( null );

odp( namespaces, 'createNamespace', {
	get () {
		return ( name: string, config = {} ) => {
			return new Namespace( name, config );
		};
	},
	enumerable: true
} );

odp( namespaces, 'namespaces', {
	get () {
		return namespaceStorage;
	},
	enumerable: true
} );

odp( namespaces, 'defaultNamespace', {
	get () {
		return DEFAULT_NAMESPACE;
	},
	enumerable: true
} );

odp( namespaces, SymbolDefaultNamespace, {
	get () {
		return DEFAULT_NAMESPACE;
	}
} );

odp( namespaces, 'defaultOptionsKeys', {
	get () {
		return Object.keys( defaultOptions );
	}
} );
