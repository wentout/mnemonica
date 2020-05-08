'use strict';

const odp = Object.defineProperty;

const {

	SymbolConstructorName,
	SymbolGaia,
	SymbolReplaceGaia,

	MNEMONICA,
	GAIA,
	URANUS

} = require('../../constants');

const {
	getTypeChecker,
} = require('./utils');

const extract = require('../../utils/extract');
const parent = require('../../utils/parent');
const pick = require('../../utils/pick');

const exceptionConstructor = require('./exceptionConstructor');

const {
	InstanceCreator
} = require('./InstanceCreator');


const Gaia = function (Uranus) {

	const gaiaProto = Uranus ? Uranus : this;

	const GaiaConstructor = function () {};
	GaiaConstructor.prototype = Object.create(gaiaProto);

	const gaia = new GaiaConstructor;

	odp(gaia, MNEMONICA, {
		get () {
			return !Uranus ? GAIA : URANUS;
		}
	});

	return gaia;
};


const MnemonicaProtoProps = {

	extract () {
		return function () {
			return extract(this);
		};
	},

	pick () {
		return function (...args) {
			return pick(this, ...args);
		};
	},

	parent () {
		return function (constructorLookupPath) {
			return parent(this, constructorLookupPath);
		};
	},

	clone () {
		return this.fork();
	},

	fork () {

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
		return function (...forkArgs) {

			var forked;
			const Constructor = isSubType ?
				existentInstance :
				collection;

			const args = forkArgs.length ? forkArgs : __args__;


			if (this === __self__) {
				forked = new (Constructor[TypeName])(...args);
			} else {
				// fork.call ? let's do it !
				forked = new InstanceCreator(type, this, args);
			}

			return forked;

		};
	},

	[SymbolReplaceGaia] () {
		return function (uranus) {
			Reflect.setPrototypeOf(Reflect.getPrototypeOf(this[SymbolGaia]), uranus);
		};
	},

	[SymbolConstructorName] () {
		return MNEMONICA;
	},

	exception () {
		const me = this;
		return function (error, ...args) {
			const target = new.target;
			return exceptionConstructor.call(me, target, error, ...args);
		};
	}

};

const Mnemosyne = function (namespace, gaia) {

	const Mnemonica = function () {
		odp(this, SymbolConstructorName, {
			get () {
				return namespace.name;
			}
		});
	};

	const mnemonica = Reflect.getPrototypeOf(gaia);

	Reflect.setPrototypeOf(Mnemonica.prototype, mnemonica);
	Mnemonica.prototype.constructor = Mnemonica;

	Object.entries(MnemonicaProtoProps).forEach(([name, method]) => {
		odp(Mnemonica.prototype, name, {
			get () {
				return method.call(this);
			}
		});
	});

	Object.getOwnPropertySymbols(MnemonicaProtoProps).forEach(symbol => {
		odp(Mnemonica.prototype, symbol, {
			get () {
				return MnemonicaProtoProps[symbol].call(this);
			}
		});
	});

	// instance of self Constructor type
	odp(Mnemonica.prototype, Symbol.hasInstance, {
		get () {
			return getTypeChecker(this.constructor.name);
		}
	});

	odp(Mnemonica.prototype, SymbolGaia, {
		get () {
			return gaia;
		}
	});

	const proto = new Mnemonica();

	Reflect.setPrototypeOf(this, proto);

};


module.exports = {
	Gaia,
	Mnemosyne,
	get MnemosynePrototypeKeys () {
		return Object.keys(MnemonicaProtoProps);
	}
};
