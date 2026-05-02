'use strict';

// Step 5 of construction pipeline: the default ModificationConstructor.
// Wires the prototype chain by creating a Mnemosyne object inheriting
// from the parent instance, attaching internal props, and linking
// ModificatorType.prototype to it. This is what makes instanceof work.

export default function () {

	const CreateInstanceModificator = function (
		this: object,
		ModificatorType: CallableFunction,
		ModificatorTypePrototype: { [index: string]: unknown },
		_addProps: CallableFunction
	) {

		 
		const existentInstance = this;

		// inherited
		const Mnemosyne = {};
		Reflect.setPrototypeOf(Mnemosyne, existentInstance);
		_addProps(Mnemosyne);

		// about to setup constructor property for new instance
		// Object.defineProperty(inherited, 'constructor', {
		Object.defineProperty(Mnemosyne, 'constructor', {
			get () {
				return ModificatorType;
			},
			enumerable : false
		});

		// modification itself
		// so now we have to copy all constructor props
		const props = Object.getOwnPropertyDescriptors(ModificatorTypePrototype);
		props.constructor = {
			// @ts-expect-error I'm too lazy for that
			value : ModificatorType
		};
		Object.defineProperties(ModificatorType.prototype, props);

		// and set the prototype inherited
		// Reflect.setPrototypeOf(ModificatorType.prototype, inherited);
		Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne);

		return ModificatorType;

	};

	return CreateInstanceModificator;

}
