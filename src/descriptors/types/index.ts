'use strict';

import type {
	_Internal_TC_,
	CreateTypesCollectionFunction,
	TypesCollection,
	hooksOpts,
	hook
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
import {
	define, lookup, type TypesMap 
} from '../../api/types';

import * as hooksAPI from '../../api/hooks';

const {
	registerHook,
	invokeHook,
	registerFlowChecker,
} = hooksAPI;

const typesCollections = new Map();

const TypesCollection = function ( _config: Record<string, unknown> ) {
	 
	const self = this;

	const subtypes = new Map();

	// default config is less important than types collection config
	const config = defaultOptionsKeys.reduce(
		( o: Record<string, unknown>, key: string ) => {
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
		},
		{} 
	);

	odp(
		this,
		SymbolConfig,
		{
			get () {
				return config;
			}
		} 
	);

	odp(
		this,
		Symbol.hasInstance,
		{
			get () {
				const result = ( instance: { [SymbolConstructorName]?: string } ) => {
					const checkResult = instance[ SymbolConstructorName ] === MNEMONICA;
					return checkResult;
				};
				return result;
			}
		} 
	);

	odp(
		this,
		'subtypes',
		{
			get () {
				return subtypes;
			}
		} 
	);

	// For instanceof MNEMOSYNE
	odp(
		subtypes,
		MNEMOSYNE,
		{
			get () {
			// returning proxy
				const result = typesCollections.get( self );
				return result;
			}
		} 
	);

	// For instanceof MNEMOSYNE
	odp(
		this,
		MNEMOSYNE,
		{
			get () {
			// returning proxy
				const result = typesCollections.get( self );
				return result;
			}
		} 
	);

	const hooks = Object.create( null );
	odp(
		this,
		'hooks',
		{
			get () {
				return hooks;
			}
		} 
	);

} as _Internal_TC_<object>;

odp(
	TypesCollection.prototype,
	MNEMONICA,
	{
		get () {
			const result = typesCollections.get( this );
			return result;
		}
	} 
);

odp(
	TypesCollection.prototype,
	'define',
	{
		get (this: { subtypes: Map<string, object> }) {
			const { subtypes } = this;
			const result = function (
				this: CallableFunction,
				TypeOrTypeName: string | CallableFunction,
				constructHandlerOrConfig?: CallableFunction | object,
				config?: object
			) {
			// this - define function of mnemonica interface
				const defineResult = define.call(
					this as unknown,
					subtypes as TypesMap,
					TypeOrTypeName,
					constructHandlerOrConfig,
					config
				);
				return defineResult;
			};
			return result;
		},
		enumerable : true
	} 
);

odp(
	TypesCollection.prototype,
	'lookup',
	{
		get (this: { subtypes: Map<string, object> }) {
			const result = function (
				this: { subtypes: Map<string, object> },
				TypeNestedPath: string
			) {
				const lookupResult = lookup.call(
 this.subtypes as unknown as TypesMap,
 TypeNestedPath 
				);
				return lookupResult;
			}.bind( this );
			return result;
		},
		enumerable : true
	} 
);

odp(
	TypesCollection.prototype,
	'registerHook',
	{
		get (this: TypesCollection) {
		 
			const self = this;
			const result = function ( hookName: string, hookCallback: hook ) {
			// return proto.registerHook.call( typesCollections.get( self ), hookName, hookCallback );
				const hookResult = registerHook.call(
					self,
					hookName,
					hookCallback 
				);
				return hookResult;
			}.bind( this );
			return result;
		},
		enumerable : true
	} 
);

odp(
	TypesCollection.prototype,
	'invokeHook',
	{
		get (this: TypesCollection) {
			const result = ( hookName: string, opts: { [index: string]: unknown } ) => {
				const hookResult = invokeHook.call(
					typesCollections.get( this ),
					hookName,
opts as hooksOpts 
				);
				return hookResult;
			};
			return result;
		}
	} 
);

odp(
	TypesCollection.prototype,
	'registerFlowChecker',
	{
		get (this: TypesCollection) {
			const result = ( flowCheckerCallback: () => unknown ) => {
				const checkerResult = registerFlowChecker.call(
					typesCollections.get( this ),
					flowCheckerCallback 
				);
				return checkerResult;
			};
			return result;
		}
	} 
);


interface TypesCollectionTarget {
	subtypes: TypesMap;
	define: (name: string, ctor: FunctionConstructor) => object;
}

const typesCollectionProxyHandler = {
	get ( target: TypesCollectionTarget, prop: string ) {
		if ( target.subtypes.has( prop ) ) {
			// access to subtype
			// for new call or defining new type
			const subtypeResult = target.subtypes.get( prop );
			return subtypeResult;
		}
		if ( prop === 'define' ) {
			// will hopefully define new type
			return target.define;
		}
		const reflectResult = Reflect.get(
			target,
			prop 
		);
		return reflectResult;
	},
	set ( target: TypesCollectionTarget, TypeName: string, Constructor: FunctionConstructor ) {
		target.define(
			TypeName,
			Constructor 
		);
		return true;
	},
	// Object.prototype.hasOwnProperty.call
	getOwnPropertyDescriptor ( target: TypesCollectionTarget, prop: string ) {
		if ( target.subtypes.has( prop ) ) {
			const descriptorResult = {
				configurable : true,
				enumerable   : true,
				writable     : false,
				value        : target.subtypes.get( prop )
			};
			return descriptorResult;
		}
		const ownPropResult = Reflect.getOwnPropertyDescriptor( target, prop );
		return ownPropResult;
	}
};

const createTypesCollection = ( config: Record<string, unknown> = {} ) => {

	const typesCollection = new TypesCollection( config );
	const typesCollectionProxy = new Proxy(
		typesCollection,
		typesCollectionProxyHandler 
	);

	typesCollections.set(
		typesCollection,
		typesCollectionProxy 
	);

	return typesCollectionProxy;

};

const DEFAULT_TYPES = createTypesCollection();
odp(
	DEFAULT_TYPES,
	SymbolDefaultTypesCollection,
	{
		get () {
			return true;
		}
	} 
);

export const types = {
	get createTypesCollection (): CreateTypesCollectionFunction {
		const result = function ( config: Record<string, unknown> = {} ): TypesCollection {
			const collectionResult = createTypesCollection( config ) as TypesCollection;
			return collectionResult;
		};
		return result;
	},
	get defaultTypes (): TypesCollection {
		const result = DEFAULT_TYPES as TypesCollection;
		return result;
	}

};
