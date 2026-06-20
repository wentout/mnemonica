'use strict';

import type {
	MnemonicaConstructor, AddPropsCallback 
} from '../../types';

// Step 5 of construction pipeline: the default ModificationConstructor.
// Wires the prototype chain by creating a Mnemosyne object inheriting
// from the parent instance, attaching internal props, and linking
// ModificatorType.prototype to it. This is what makes instanceof work.

export default function () {

	const CreateInstanceModificator = function (
		this: object,
		ModificatorType: MnemonicaConstructor,
		ModificatorTypePrototype: { [index: string]: unknown },
		_addProps: AddPropsCallback
	) {

		 
		const existentInstance = this;

		// inherited
		// TODO: subtype constructors could be attached directly to this
		// Mnemosyne object as non-enumerable getters, which would let us
		// remove the root Mnemosyne Proxy entirely and rely on normal
		// prototype-chain lookup for `instance.SubType`. Getters give lazy
		// initialization, prevent accidental re-definition, and let each
		// access rely on the current runtime state of the type graph
		// (ModificatorType, ModificatorTypePrototype, and any factories that
		// may produce new fields or constructors). That would simplify
		// subtype access but would increase cyclomatic complexity here and
		// would lose the ability to define new subtypes after the instance
		// is created. Users who need dynamic post-creation definitions can
		// use `.fork()` or `.clone()` to get fresh instances that carry the
		// updated constructors on their chain.
		const Mnemosyne = {};
		Reflect.setPrototypeOf(
			Mnemosyne,
			existentInstance
		);
		_addProps(Mnemosyne);

		// about to setup constructor property for new instance
		// Object.defineProperty(inherited, 'constructor', {
		Object.defineProperty(
			Mnemosyne,
			'constructor',
			{
				get () {
					return ModificatorType;
				},
				enumerable : false
			}
		);

		// modification itself
		// so now we have to copy all constructor props
		const props = Object.getOwnPropertyDescriptors(ModificatorTypePrototype);
		props.constructor = {
			// @ts-expect-error I'm too lazy for that
			value : ModificatorType
		};
		Object.defineProperties(
			ModificatorType.prototype,
			props
		);

		// and set the prototype inherited
		// Reflect.setPrototypeOf(ModificatorType.prototype, inherited);
		Reflect.setPrototypeOf(
			ModificatorType.prototype,
			Mnemosyne
		);

		return ModificatorType;

	};

	return CreateInstanceModificator;

}
