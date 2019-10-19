'use strict';

// const {
// 	SymbolConstructorName,
// } = require('../../constants');

// so we should create function
// which will return proper constructor
// inherited from existent instance

module.exports = function () {

	const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype, addProps) {

		const existentInstance = this;

		// const TripleSchemeClosure = function () {
		// const Mnemosyne = this;

		const Mnemosyne = Object.create(existentInstance);
		addProps(Mnemosyne);

		// about to setup constructor property for new instance
		// Object.defineProperty(inherited, 'constructor', {
		Object.defineProperty(Mnemosyne, 'constructor', {
			get() {
				return ModificatorType;
			}
		});

		// modification itself
		// so now we have to copy all constructor props
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			(
				name !== 'constructor'
				// &&
				// name !== SymbolConstructorName
			) && (ModificatorType.prototype[name] = value);
		});
		ModificatorType.prototype.constructor = ModificatorType;

		// and set the prototype inherited
		Object.setPrototypeOf(ModificatorType.prototype, Mnemosyne);
		// Object.setPrototypeOf(ModificatorType.prototype, inherited);

		return ModificatorType;

		// };
		// TripleSchemeClosure.prototype = existentInstance;
		// return new TripleSchemeClosure();

	};

	return CreateInstanceModificator;

};
