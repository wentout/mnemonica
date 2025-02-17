'use strict';

import { ConstructorFunction } from '../../types';
import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceUranus,

	MNEMONICA,
	GAIA,
	URANUS

} = constants;

import TypesUtils from '../utils';
const {
	getTypeChecker,
	reflectPrimitiveWrappers
} = TypesUtils;

import { extract } from '../../utils/extract';
import { parent } from '../../utils/parent';
import { pick } from '../../utils/pick';

import exceptionConstructor from '../errors/exceptionConstructor';

import { InstanceCreator } from './InstanceCreator';

const Gaia = function ( Uranus: any ) {

	const gaiaProto = Uranus ? Uranus : this;

	const GaiaConstructor = function () { } as ConstructorFunction<object>;
	GaiaConstructor.prototype = Object.create( gaiaProto );

	const gaia = new GaiaConstructor;

	odp( gaia, MNEMONICA, {
		get () {
			return !Uranus ? GAIA : URANUS;
		}
	} );

	return gaia;
} as ConstructorFunction<object>;


const MnemonicaProtoProps = {

	extract () {
		return function ( this: any ) {
			return extract( this );
		};
	},

	pick () {
		return function ( this: any, ...args: any[] ) {
			return pick( this, ...args );
		};
	},

	parent () {
		return function ( this: any, constructorLookupPath: string ) {
			return parent( this, constructorLookupPath );
		};
	},

	clone ( this: any ) {
		return this.fork();
	},

	fork ( this: any ) {

		const {
			__type__: type,
			__collection__: collection,
			__parent__: existentInstance,
			__args__,
			__self__
		} = this;

		const {
			isSubType,
			TypeName
		} = type;

		// 'function', cause might be called with 'new'
		// eslint-disable-next-line no-shadow, @typescript-eslint/no-explicit-any
		return function ( this: any, ...forkArgs: any[] ) {

			let forked;
			const Constructor = isSubType ?
				existentInstance :
				collection;

			const args = forkArgs.length ? forkArgs : __args__;


			if ( this === __self__ ) {
				forked = new ( Constructor[ TypeName ] )( ...args );
			} else {
				// fork.call ? let's do it !
				forked = new InstanceCreator( type, reflectPrimitiveWrappers( this ), args );
			}

			return forked;

		};
	},

	[ SymbolReplaceUranus ] () {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return function ( this: any, uranus: any ) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			Reflect.setPrototypeOf( Reflect.getPrototypeOf( this[ SymbolGaia ] ), uranus );
		};
	},

	[ SymbolConstructorName ] () {
		return MNEMONICA;
	},

	exception () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		return function ( error: Error, ...args: any[] ) {
			const target = new.target;
			return exceptionConstructor.call( self, target, error, ...args );
		};
	},

	sibling () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-explicit-any
		const self: any = this;
		const siblings = ( SiblingTypeName: string ) => {
			const {
				__collection__: collection,
			} = self;
			const sibling: any = collection[ SiblingTypeName ];
			return sibling;
		};

		return new Proxy( siblings, {
			get ( _, prop: string ) {
				return siblings( prop );
			},
			apply ( _, __, args, ) {
				return siblings( args[ 0 ] );
			}
		} );
	}

};

const TypesRoots = new WeakMap;

const Mnemosyne = function ( gaia: any ) {
	
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const instance = this;

	const Mnemonica: any = function ( this: any ) {
		odp( this, SymbolConstructorName, {
			get () {
				return MNEMONICA;
			}
		} );
	};

	const mnemonica = Reflect.getPrototypeOf( gaia );

	Reflect.setPrototypeOf( Mnemonica.prototype, mnemonica );

	Object.entries( MnemonicaProtoProps ).forEach( ( [ name, method ]: [ string, any ] ) => {
		odp( Mnemonica.prototype, name, {
			get ( this: any ) {
				return method.call( this );
			}
		} );
	} );

	Object.getOwnPropertySymbols( MnemonicaProtoProps ).forEach( ( symbol: symbol ) => {
		odp( Mnemonica.prototype, symbol, {
			get () {
				const symbolMethod = Reflect.get( MnemonicaProtoProps, symbol );
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				return symbolMethod.call( this );
			}
		} );
	} );

	// instance of self Constructor type
	odp( Mnemonica.prototype, Symbol.hasInstance, {
		get () {
			return getTypeChecker( this.constructor.name );
		}
	} );

	odp( Mnemonica.prototype, SymbolGaia, {
		get () {
			return gaia;
		}
	} );

	const proto = new Mnemonica();
	
	TypesRoots.set( instance, proto );
	
	Reflect.setPrototypeOf( instance, proto );

} as ConstructorFunction<typeof MnemonicaProtoProps>;


export default {
	Gaia,
	Mnemosyne,
	get MnemosynePrototypeKeys () {
		return Object.keys( MnemonicaProtoProps );
	}
};
