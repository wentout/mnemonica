'use strict';

const { mnemonica } = require('../src/index');
const { defaultOptions: { ModificationConstructor } } = mnemonica;

interface ExistentInstance {
	goneToFallback?: unknown;
}

interface ModificatorType {
	prototype: object;
}

type AddPropsFunction = (mnemosyne: unknown) => void;

module.exports = function (): (
	this: ExistentInstance,
	ModificatorType: ModificatorType,
	ModificatorTypePrototype: Record<string, unknown>,
	addProps: AddPropsFunction
) => unknown {

	const CreateInstanceModificatorAncient200XthWay = function (
		this: ExistentInstance,
		ModificatorType: ModificatorType,
		ModificatorTypePrototype: Record<string, unknown>,
		addProps: AddPropsFunction
	): unknown {

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const existentInstance = this;

		try {
			const TripleSchemeClosure = function (this: unknown): unknown {

				// eslint-disable-next-line @typescript-eslint/no-this-alias
				const Mnemosyne = this;
				addProps(Mnemosyne);

				const Inherico = function (this: unknown): ModificatorType {

					// eslint-disable-next-line @typescript-eslint/no-this-alias
					const moreInherited = this;

					ModificatorType.prototype = moreInherited as object;

					Object.assign(ModificatorType.prototype, ModificatorTypePrototype);

					Object.defineProperty(ModificatorType.prototype, 'constructor', {
						get(): ModificatorType {
							return ModificatorType;
						},
						enumerable: false
					});

					return ModificatorType;

				};

				Inherico.prototype = Mnemosyne;
				(Inherico.prototype as { constructor?: unknown }).constructor = ModificatorType;

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return new (Inherico as unknown as new () => ModificatorType)();
			};

			TripleSchemeClosure.prototype = existentInstance;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return new (TripleSchemeClosure as unknown as new () => unknown)();

		} catch (error: unknown) {

			try {
				if (!existentInstance.goneToFallback) {
					Object.defineProperty(existentInstance, 'goneToFallback', {
						get(): unknown {
							return error;
						}
					});
				}
			} catch (err) {
				console.error(err);
				process.exit(1);
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
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
