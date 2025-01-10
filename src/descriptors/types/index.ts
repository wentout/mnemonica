'use strict';

import {
	ConstructorFunction
} from '../../types';

import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,
	SymbolDefaultTypesCollection,
	SymbolConfig,
	defaultOptions,
	defaultOptionsKeys,
	MNEMONICA,
	MNEMOSYNE,
} = constants;

// here is TypesCollection.define() method
import { define, lookup } from '../../api/types';

import * as hooksAPI from '../../api/hooks';

const {
	registerHook,
	invokeHook,
	registerFlowChecker,
} = hooksAPI;

const typesCollections = new Map();

const TypesCollection = function ( _config: Record<string, unknown> ) {

	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this;

	const subtypes = new Map();

	// default config is less important than types collection config
	const config = defaultOptionsKeys.reduce( ( o: Record<string, unknown>, key: string ) => {
		const value = _config[ key ];
		const option = defaultOptions[ key ];
		const t_conf = typeof value;
		const t_opts = typeof option;
		if ( t_conf === t_opts ) {
			o[ key ] = value;
		} else {
			o[ key ] = option;
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
				return instance[ SymbolConstructorName ] === MNEMONICA;
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
			return typesCollections.get( self );
		}
	} );

	// For instanceof MNEMOSYNE
	odp( this, MNEMOSYNE, {
		get () {
			// returning proxy
			return typesCollections.get( self );
		}
	} );

	const hooks = Object.create( null );
	odp( this, 'hooks', {
		get () {
			return hooks;
		}
	} );

} as ConstructorFunction<object>;

odp( TypesCollection.prototype, MNEMONICA, {
	get () {
		return typesCollections.get( this );
	}
} );

odp( TypesCollection.prototype, 'define', {
	get () {
		const {
			subtypes
		} = this;
		return function ( this: any, ...args: any[] ) {
			// this - define function of mnemonica interface
			return define.call( this, subtypes, ...args );
		};
	},
	enumerable : true
} );

odp( TypesCollection.prototype, 'lookup', {
	get () {
		return function ( this: any, ...args: any[] ) {
			return lookup.call( this.subtypes, ...args );
		}.bind( this );
	},
	enumerable : true
} );

odp( TypesCollection.prototype, 'registerHook', {
	get () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		return function ( this: unknown, hookName: string, hookCallback: CallableFunction ) {
			// return proto.registerHook.call( typesCollections.get( self ), hookName, hookCallback );
			return registerHook.call( self, hookName, hookCallback );
		}.bind( this );
	},
	enumerable : true
} );

odp( TypesCollection.prototype, 'invokeHook', {
	get () {
		return function ( this: unknown, hookName: string, hookCallback: CallableFunction ) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;
			// return proto.invokeHook.call( typesCollections.get( self ), hookName, hookCallback );
			return invokeHook.call( typesCollections.get( self ), hookName, hookCallback );
		}.bind( this );
	}
} );

odp( TypesCollection.prototype, 'registerFlowChecker', {
	get () {
		return function ( this: unknown, flowCheckerCallback: () => unknown ) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;
			return registerFlowChecker.call( typesCollections.get( self ), flowCheckerCallback );
		}.bind( this );
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
	// Object.prototype.hasOwnProperty.call
	getOwnPropertyDescriptor ( target: any, prop: string ) {
		return target.subtypes.has( prop ) ? {
			configurable : true,
			enumerable   : true,
			writable     : false,
			value        : target.subtypes.get( prop )
		} : undefined;
	}
};

const createTypesCollection = ( config = {} ) => {

	const typesCollection = new TypesCollection( config );
	const typesCollectionProxy = new Proxy( typesCollection, typesCollectionProxyHandler );

	typesCollections.set( typesCollection, typesCollectionProxy );

	return typesCollectionProxy;

};

const DEFAULT_TYPES = createTypesCollection();
odp( DEFAULT_TYPES, SymbolDefaultTypesCollection, {
	get () {
		return true;
	}
} );

export const types = {
	get createTypesCollection () {
		return function ( config = {} ) {
			return createTypesCollection( config );
		};
	},
	get defaultTypes () {
		return DEFAULT_TYPES;
	}

};
