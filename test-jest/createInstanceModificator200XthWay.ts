'use strict';

const { mnemonica } = require('../src/index');
const { defaultOptions: { ModificationConstructor } } = mnemonica;

module.exports = function () {

	const CreateInstanceModificatorAncient200XthWay = function (
		ModificatorType: any,
		ModificatorTypePrototype: any,
		addProps: any
	) {

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const existentInstance = this;

		try {
			const TripleSchemeClosure = function () {

				// eslint-disable-next-line @typescript-eslint/no-this-alias
				const Mnemosyne = this;
				addProps(Mnemosyne);

				const Inherico = function () {

					// eslint-disable-next-line @typescript-eslint/no-this-alias
					const moreInherited = this;

					ModificatorType.prototype = moreInherited;

					Object.assign(ModificatorType.prototype, ModificatorTypePrototype);

					Object.defineProperty(ModificatorType.prototype, 'constructor', {
						get() {
							return ModificatorType;
						},
						enumerable: false
					});

					return ModificatorType;

				};

				Inherico.prototype = Mnemosyne;
				Inherico.prototype.constructor = ModificatorType;

				return new Inherico();
			};

			TripleSchemeClosure.prototype = existentInstance;
			return new TripleSchemeClosure();

		} catch (error) {

			try {
				if (!existentInstance.goneToFallback) {
					Object.defineProperty(existentInstance, 'goneToFallback', {
						get() {
							return error;
						}
					});
				}
			} catch (err) {
				console.error(err);
				process.exit(1);
			}

			return ModificationConstructor()
				.call(
					existentInstance,
					ModificatorType,
					ModificatorTypePrototype,
					addProps
				);
		}
	};

	return CreateInstanceModificatorAncient200XthWay;

};
