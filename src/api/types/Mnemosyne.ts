'use strict';

import { ConstructorFunction } from '../../types';
import { constants } from '../../constants';
const {
	odp,
	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceGaia,

	MNEMONICA,
	GAIA,
	URANUS

} = constants;

import TypesUtils from './utils';
const {
	getTypeChecker,
} = TypesUtils;

import { extract } from '../../utils/extract';
import { parent } from '../../utils/parent';
import { pick } from '../../utils/pick';

import exceptionConstructor from './exceptionConstructor';

import { InstanceCreator } from './InstanceCreator';

const Gaia = function ( Uranus: any ) {

	const gaiaProto = Uranus ? Uranus : this;

	// tslint:disable-next-line: only-arrow-functions no-empty
	const GaiaConstructor = function () {} as ConstructorFunction<{}>;
	GaiaConstructor.prototype = Object.create( gaiaProto );

	const gaia = new GaiaConstructor;

	odp( gaia, MNEMONICA, {
		get () {
			return !Uranus ? GAIA : URANUS;
		}
	} );

	return gaia;
} as ConstructorFunction<{}>;


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
				forked = new InstanceCreator( type, this, args );
			}

			return forked;

		};
	},

	[ SymbolReplaceGaia ] () {
		return function ( this: any, uranus: any ) {
			Reflect.setPrototypeOf( Reflect.getPrototypeOf( this[ SymbolGaia ] ), uranus );
		};
	},

	[ SymbolConstructorName ] () {
		return MNEMONICA;
	},

	exception () {
		const me = this;
		// tslint:disable-next-line: only-arrow-functions
		return function ( error: Error, ...args: any[] ) {
			const target = new.target;
			return exceptionConstructor.call( me, target, error, ...args );
		};
	}

};

const Mnemosyne = function ( namespace: any, gaia: any ) {

	const Mnemonica: any = function ( this: any ) {
		odp( this, SymbolConstructorName, {
			get () {
				return namespace.name;
			}
		} );
	};

	const mnemonica = Reflect.getPrototypeOf( gaia );

	Reflect.setPrototypeOf( Mnemonica.prototype, mnemonica );
	Mnemonica.prototype.constructor = Mnemonica;

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
				const symbolMethod = Reflect.get(MnemonicaProtoProps, symbol);
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

	Reflect.setPrototypeOf( this, proto );

} as ConstructorFunction<typeof MnemonicaProtoProps>;


export default {
	Gaia,
	Mnemosyne,
	get MnemosynePrototypeKeys () {
		return Object.keys( MnemonicaProtoProps );
	}
};
