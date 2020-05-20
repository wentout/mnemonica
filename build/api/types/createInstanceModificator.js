'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
function default_1 () {
	const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype, addProps) {
		const existentInstance = this;
		const Mnemosyne = Object.create(existentInstance);
		addProps(Mnemosyne);
		Object.defineProperty(Mnemosyne, 'constructor', {
			get () {
				return ModificatorType;
			}
		});
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			(name !== 'constructor') && (ModificatorType.prototype[name] = value);
		});
		ModificatorType.prototype.constructor = ModificatorType;
		Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne);
		return ModificatorType;
	};
	return CreateInstanceModificator;
}
exports.default = default_1;

