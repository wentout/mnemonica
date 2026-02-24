'use strict';

import type {
	ConstructorFunction,
	CreateTypesCollectionFunction,
	TypesCollection
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
			return ( instance: { [SymbolConstructorName]?: string } ) => {
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
	get (this: { subtypes: Map<string, object> }) {
		const {
			subtypes
		} = this;
		return function (
			this: unknown,
			TypeOrTypeName: string | CallableFunction,
			constructHandlerOrConfig?: CallableFunction | object,
			config?: object
		) {
			// this - define function of mnemonica interface
			return define.call( this as CallableFunction, subtypes as Map<string, object>, TypeOrTypeName, constructHandlerOrConfig, config );
		};
	},
	enumerable : true
} );

odp( TypesCollection.prototype, 'lookup', {
	get (this: { subtypes: Map<string, object> }) {
		return function (
			this: { subtypes: Map<string, object> },
			TypeNestedPath: string
		) {
			return lookup.call( this.subtypes, TypeNestedPath );
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


interface TypesCollectionTarget {
	subtypes: Map<string, object>;
	define: (name: string, ctor: FunctionConstructor) => object;
}

const typesCollectionProxyHandler = {
	get ( target: TypesCollectionTarget, prop: string ) {
		if ( target.subtypes.has( prop ) ) {
			return target.subtypes.get( prop );
		}
		return Reflect.get( target, prop );
	},
	set ( target: TypesCollectionTarget, TypeName: string, Constructor: FunctionConstructor ) {
		target.define( TypeName, Constructor );
		return true;
	},
	// Object.prototype.hasOwnProperty.call
	getOwnPropertyDescriptor ( target: TypesCollectionTarget, prop: string ) {
		return target.subtypes.has( prop ) ? {
			configurable : true,
			enumerable   : true,
			writable     : false,
			value        : target.subtypes.get( prop )
		} : undefined;
	}
};

const createTypesCollection = ( config: Record<string, unknown> = {} ) => {

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
	get createTypesCollection (): CreateTypesCollectionFunction {
		return function ( config: Record<string, unknown> = {} ): TypesCollection {
			return createTypesCollection( config ) as TypesCollection;
		};
	},
	get defaultTypes (): TypesCollection {
		return DEFAULT_TYPES as TypesCollection;
	}

};
