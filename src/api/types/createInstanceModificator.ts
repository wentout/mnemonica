'use strict';

export default function (obey: CallableFunction) {

	const CreateInstanceModificator = function (
		this: object,
		ModificatorType: CallableFunction,
		ModificatorTypePrototype: { [index: string]: unknown },
		_addProps: CallableFunction
	) {

		// eslint-disable-next-line @typescript-eslint/no-this-alias
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			value : ModificatorType
		};
		Object.defineProperties(ModificatorType.prototype, props);

		// and set the prototype inherited
		// Reflect.setPrototypeOf(ModificatorType.prototype, inherited);
		Reflect.setPrototypeOf(ModificatorType.prototype, Mnemosyne);

		obey(existentInstance, ModificatorType);

		return ModificatorType;

	};

	return CreateInstanceModificator;

}
