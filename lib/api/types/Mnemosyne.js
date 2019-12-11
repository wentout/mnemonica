'use strict';

const odp = Object.defineProperty;

const {

	SymbolConstructorName,
	SymbolGaia,

	MNEMONICA,
	GAIA,
	URANUS

} = require('../../constants');

const {
	getTypeChecker,
} =	require('./utils');

const extract = require('../../utils/extract');
const parent = require('../../utils/parent');
const pick = require('../../utils/pick');

const {
	InstanceCreator
} = require('./InstanceCreator');


const Gaia = function (Uranus) {

	const gaia = !Uranus ? this :
		Object.setPrototypeOf(this, Uranus);

	odp(gaia, MNEMONICA, {
		get () {
			return !Uranus ? GAIA : URANUS;
		}
	});

	return gaia;
};


const Mnemosyne = function (namespace, gaia) {

	const Mnemonica = function () {
		odp(this, SymbolConstructorName, {
			get () {
				return namespace.name;
			}
		});
	};

	const mnemonica = Object.getPrototypeOf(gaia);

	Object.setPrototypeOf(Mnemonica.prototype, mnemonica);
	Mnemonica.prototype.constructor = Mnemonica;

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

	odp(Mnemonica.prototype, SymbolConstructorName, {
		get () {
			return MNEMONICA;
		}
	});

	odp(Mnemonica.prototype, 'extract', {
		get () {
			return function () {
				return extract(this);
			};
		}
	});

	odp(Mnemonica.prototype, 'pick', {
		get () {
			return function (...args) {
				return pick(this, ...args);
			};
		}
	});

	odp(Mnemonica.prototype, 'parent', {
		get () {
			return function (constructorLookupPath) {
				return parent(this, constructorLookupPath);
			};
		}
	});

	odp(Mnemonica.prototype, 'clone', {
		get () {
			return this.fork();
		}
	});

	odp(Mnemonica.prototype, 'fork', {
		get () {

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
		}
	});

	const proto = new Mnemonica();

	Object.setPrototypeOf(this, proto);

};

module.exports = {
	Gaia,
	Mnemosyne
};
