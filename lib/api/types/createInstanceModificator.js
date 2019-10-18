'use strict';

const {
	SymbolConstructorName,
} = require('../../constants');

// so we should create function
// which will return proper constructor
// inherited from existent instance

module.exports = function () {

	const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype) {

		const existentInstance = this;

		// const Mnemosyne = function () {
		// const inherited = this;
		const Mnemosyne = Object.create(existentInstance);

		// about to setup constructor property for new instance
		// Object.defineProperty(inherited, 'constructor', {
		Object.defineProperty(Mnemosyne, 'constructor', {
			get() {
				return ModificatorType;
			}
		});

		// modification itself
		// so now we have to copy all constructor props
		if (ModificatorType.prototype !== ModificatorTypePrototype) {
			Object.entries(ModificatorTypePrototype).forEach((entry) => {
				const [name, value] = entry;
				(
					name !== 'constructor' &&
					name !== SymbolConstructorName
				) && (ModificatorType.prototype[name] = value);
			});
		} else {
			// next line is about to fix constructor 4 util.inspect
			ModificatorType.prototype.constructor = ModificatorType;
		}

		// and set the prototype inherited
		Object.setPrototypeOf(ModificatorType.prototype, Mnemosyne);
		// Object.setPrototypeOf(ModificatorType.prototype, inherited);

		return ModificatorType;

		// };

		// return new Mnemosyne();

	};

	return CreateInstanceModificator;

};
