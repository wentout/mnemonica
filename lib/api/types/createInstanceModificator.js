'use strict';

const {
	SymbolConstructorName,
} = require('../../constants');

// so we should create function
// which will return proper constructor
// inherited from existent instance

module.exports = function () {
	
	const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype) {
		
		const existentInstance = this;
		// For the 1st child : Type Itself
		// it referes to "MnemonicaBase"
		// [""Symbol(Defined Constructor Name)""] : "MnemonicaBase"
		
		const Mnemosyne = function () {
			
			const inherited = this;
			
			// about to setup constructor property for new instance
			Object.defineProperty(inherited, 'constructor', {
				get () {
					return ModificatorType;
				}
			});
			
			// modification itself
			// so now we have to copy all constructor props
			if (ModificatorType.prototype !== ModificatorTypePrototype) {
				Object.entries(ModificatorTypePrototype).forEach((entry) => {
					const [name, value] = entry;
					(
						name !== 'constructor' &&
						name !== SymbolConstructorName
					) && (ModificatorType.prototype[name] = value);
				});
			} else {
				ModificatorType.prototype.constructor = ModificatorType;
			}
			
			// next line is about to fix constructor 4 util.inspect
			// Object.defineProperty(ModificatorType.prototype, 'constructor', {
			// 	get () {
			// 		return ModificatorType;
			// 	}
			// });
			
			// and set the prototype inherited
			Object.setPrototypeOf(ModificatorType.prototype, inherited);
			
			
			return ModificatorType;
			
		};
		
		// here "this" refers to an existent instance
		Mnemosyne.prototype = existentInstance;
		
		return new Mnemosyne();
		
	};
	
	return CreateInstanceModificator;
	
};