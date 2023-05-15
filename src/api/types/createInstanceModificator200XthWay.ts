'use strict';

import { obey } from './obeyConstructor';

export default function () {

	const CreateInstanceModificatorAncient200XthWay = function (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this: any,
		ModificatorType: CallableFunction,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ModificatorTypePrototype: { [ index: string ]: any },
		addProps: CallableFunction
	) {

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const existentInstance = this;

		// const PreTripleSchemeClosure = function () {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-shadow
		const TripleSchemeClosure: any = function ( this: any ) {

			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const Mnemosyne = this;
			addProps( Mnemosyne );

			// about to setup constructor property for new instance

			// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-shadow
			const Inherico: any = function ( this: any ) {

				// eslint-disable-next-line @typescript-eslint/no-this-alias
				const moreInherited = this;
				// so now we have to copy all the inherited props
				// to "this", leaving them untouched in future
				// Object.entries(ModificatorTypePrototype).forEach((entry) => {
				// 	const [name, value] = entry;
				// 	moreInherited[name] = value;
				// });

				// give modification itself
				ModificatorType.prototype = moreInherited;

				Object.assign( ModificatorType.prototype, ModificatorTypePrototype );

				// 2. Object.defineProperty below is done
				//    to make "constructor" property non enumerable
				//    cause we did it enumerable at "1." below
				Object.defineProperty( ModificatorType.prototype, 'constructor', {
					get () {
						return ModificatorType;
					},
					enumerable : false
				} );

				obey( existentInstance, ModificatorType );

				return ModificatorType;

			};

			// here "this" refers to an existent instance
			Inherico.prototype = Mnemosyne;
			// 1. next line is done 4 our console.log will print proper type
			// and it should be explicit declaration, or it wouldn't see
			Inherico.prototype.constructor = ModificatorType;
			// therfore the following lines are commented
			// Object.defineProperty(Inherico.prototype, 'constructor', {
			// 	get () {
			// 		return ModificatorType;
			// 	},
			// });

			return new Inherico();
		};

		// TripleSchemeClosure.prototype = this;
		TripleSchemeClosure.prototype = existentInstance;
		return new TripleSchemeClosure();

		// };
		// PreTripleSchemeClosure.prototype = existentInstance;
		// return new PreTripleSchemeClosure();

	};

	return CreateInstanceModificatorAncient200XthWay;

}
