'use strict';

// 1. init default namespace
// 2. create default namespace in types

import { hop } from '../../utils/hop';

import { ConstructorFunction } from '../../types';

import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,
	SymbolDefaultNamespace,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	MNEMONICA,
	MNEMOSYNE,
} = constants;

import { ErrorsTypes } from '../../descriptors/errors';
const {
	NAMESPACE_DOES_NOT_EXIST,
	ASSOCIATION_EXISTS,
} = ErrorsTypes;

import { namespaces } from '../namespaces';

const {
	[ SymbolDefaultNamespace ]: defaultNamespace,
	defaultOptionsKeys
} = namespaces;

// here is TypesCollection.define() method
import { define, lookup } from '../../api/types';

import * as hooksAPI from '../../api/hooks';

const proto = {
	define,
	lookup,
	...hooksAPI
};

const TypesCollection = function ( namespace: any, config: { [ index: string ]: any } ) {

	const self = this;

	const subtypes = new Map();

	// namespace config is less important than types collection config
	config = defaultOptionsKeys.reduce( ( o: { [ index: string ]: any }, key: string ) => {
		if ( typeof config[ key ] === 'boolean' ) {
			o[ key ] = config[ key ];
		} else {
			o[ key ] = namespace[ SymbolConfig ][ key ];
		}
		return o;
	}, {} );

	odp( this, SymbolConfig, {
		get () {
			return config;
		}
	} );

	odp( this, Symbol.hasInstance, {
		get () {
			return ( instance: any ) => {
				return instance[ SymbolConstructorName ] === namespace.name;
			};
		}
	} );

	odp( this, 'subtypes', {
		get () {
			return subtypes;
		}
	} );

	// For instanceof MNEMOSYNE
	odp( subtypes, MNEMOSYNE, {
		get () {
			// returning proxy
			return namespace.typesCollections.get( self );
		}
	} );

	// For instanceof MNEMOSYNE
	odp( this, MNEMOSYNE, {
		get () {
			// returning proxy
			return namespace.typesCollections.get( self );
		}
	} );

	odp( this, 'namespace', {
		get () {
			return namespace;
		}
	} );

	odp( subtypes, 'namespace', {
		get () {
			return namespace;
		}
	} );

	const hooks = Object.create( null );
	odp( this, 'hooks', {
		get () {
			return hooks;
		}
	} );

} as ConstructorFunction<{}>;


odp( TypesCollection.prototype, MNEMONICA, {
	get () {
		// returning proxy
		return this.namespace.typesCollections.get( this );
		// return this;
	}
} );

odp( TypesCollection.prototype, 'define', {
	get () {
		const {
			subtypes
		} = this;
		return function ( this: any, ...args: any[] ) {
			// this - define function of mnemonica interface
			return proto.define.call( this, subtypes, ...args );
		};
	},
	enumerable: true
} );

odp( TypesCollection.prototype, 'lookup', {
	get () {
		return function ( this: any, ...args: any[] ) {
			return proto.lookup.call( this.subtypes, ...args );
		}.bind( this );
	},
	enumerable: true
} );

odp( TypesCollection.prototype, 'registerHook', {
	get () {
		const proxy = this.namespace.typesCollections.get( this );
		return function ( this: any, hookName: string, hookCallback: CallableFunction ) {
			return proto.registerHook.call( this, hookName, hookCallback );
		}.bind( proxy );
	},
	enumerable: true
} );

odp( TypesCollection.prototype, 'invokeHook', {
	get () {
		const proxy = this.namespace.typesCollections.get( this );
		return function ( this: any, hookName: string, hookCallback: CallableFunction ) {
			return proto.invokeHook.call( this, hookName, hookCallback );
		}.bind( proxy );
	}
} );

odp( TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		const proxy = this.namespace.typesCollections.get( this );
		return function ( this: any, flowCheckerCallback: CallableFunction ) {
			return proto.registerFlowChecker.call( this, flowCheckerCallback );
		}.bind( proxy );
	}
} );


const typesCollectionProxyHandler = {
	get ( target: any, prop: string ) {
		if ( target.subtypes.has( prop ) ) {
			return target.subtypes.get( prop );
		}
		return Reflect.get( target, prop );
	},
	set ( target: any, TypeName: string, Constructor: FunctionConstructor ) {
		return target.define( TypeName, Constructor );
	},
	// has (target, prop) {
	// 	debugger;
	// },

	// Object.prototype.hasOwnProperty.call
	getOwnPropertyDescriptor ( target: any, prop: string ) {
		return target.subtypes.has( prop ) ? {
			configurable: true,
			enumerable: true,
			writeable: false,
			value: target.subtypes.get( prop )
		} : undefined;
	}
};

const createTypesCollection = ( namespace = defaultNamespace, association: any, config = {} ) => {

	if (
		!( namespace instanceof Object ) ||
		!hop( namespace, 'name' ) ||
		!namespaces.namespaces.has( namespace.name )
	) {
		throw new NAMESPACE_DOES_NOT_EXIST;
	}

	if ( namespace.typesCollections.has( association ) ) {
		throw new ASSOCIATION_EXISTS;
	}

	const typesCollection = new TypesCollection( namespace, config );
	const typesCollectionProxy = new Proxy( typesCollection, typesCollectionProxyHandler );

	namespace.typesCollections.set( typesCollection, typesCollectionProxy );
	namespace.typesCollections.set( typesCollectionProxy, typesCollection );

	if ( association ) {
		namespace.typesCollections.set( association, typesCollectionProxy );
	}

	return typesCollectionProxy;

};

const DEFAULT_TYPES = createTypesCollection( defaultNamespace, SymbolDefaultTypesCollection );
odp( DEFAULT_TYPES, SymbolDefaultTypesCollection, {
	get () {
		return true;
	}
} );

export const types = {
	get createTypesCollection () {
		// tslint:disable-next-line: only-arrow-functions
		return function ( namespace: any, association: any, config = {} ) {
			return createTypesCollection( namespace, association, config );
		};
	},
	get defaultTypes () {
		return DEFAULT_TYPES;
	}

};
