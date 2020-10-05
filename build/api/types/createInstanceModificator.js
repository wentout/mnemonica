'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const obeyConstructor_1 = require('./obeyConstructor');
function default_1 () {
	const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype, addProps) {
		const existentInstance = this;
		const Mnemosyne = {};
		Reflect.setPrototypeOf(Mnemosyne, existentInstance);
		addProps(Mnemosyne);
		Object.defineProperty(Mnemosyne, 'constructor', {
			get () {
				return ModificatorType;
			},
			enumerable : false
		});
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			if (name !== 'constructor') {
				(ModificatorType.prototype[name] = value);
			}
		});
		ModificatorType.prototype.constructor = ModificatorType;
		Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne);
		obeyConstructor_1.obey(existentInstance, ModificatorType);
		return ModificatorType;
	};
	return CreateInstanceModificator;
}
exports.default = default_1;

