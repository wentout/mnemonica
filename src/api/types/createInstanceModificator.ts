'use strict';

export default function () {

	const CreateInstanceModificator = function (
		this: any,
		ModificatorType: CallableFunction,
		ModificatorTypePrototype: { [ index: string ]: any },
		addProps: CallableFunction
	) {

		const existentInstance = this;

		// const TripleSchemeClosure = function () {
		// const Mnemosyne = this;

		const Mnemosyne = Object.create( existentInstance );
		addProps( Mnemosyne );

		// about to setup constructor property for new instance
		// Object.defineProperty(inherited, 'constructor', {
		Object.defineProperty( Mnemosyne, 'constructor', {
			get () {
				return ModificatorType;
			},
			enumerable: false
		} );

		// modification itself
		// so now we have to copy all constructor props
		Object.entries( ModificatorTypePrototype ).forEach( ( entry ) => {
			const [ name, value ] = entry;
			if (
				name !== 'constructor'
				// &&
				// name !== SymbolConstructorName
			) {
				( ModificatorType.prototype[ name ] = value );
			}
		} );
		// 1. next line is done 4 our console.log will print proper type
		// and it should be explicit declaration, or it wouldn't see
		ModificatorType.prototype.constructor = ModificatorType;
		// therfore the following lines are commented
		// Object.defineProperty(ModificatorType.prototype, 'constructor', {
		// 	get () {
		// 		return ModificatorType;
		// 	}
		// });

		// and set the prototype inherited
		Reflect.setPrototypeOf( ModificatorType.prototype, Mnemosyne );
		// Reflect.setPrototypeOf(ModificatorType.prototype, inherited);

		return ModificatorType;

		// };
		// TripleSchemeClosure.prototype = existentInstance;
		// return new TripleSchemeClosure();

	};

	return CreateInstanceModificator;

};
