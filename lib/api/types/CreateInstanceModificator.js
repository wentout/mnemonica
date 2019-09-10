'use strict';

const {
	MNEMOSYNE,
	SymbolConstructorName
} = require('../../constants');

// so we should create function
// which will return proper constructor
// inherited from existent instance

const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st child : Type Itself
	// it referes to "MnemonicaBase"
	// [""Symbol(Defined Constructor Name)""] : "MnemonicaBase"
	const existentInstance = this;
	
	const Mnemosyne = function () {
			
		// about to setup constructor property for new instance
		Object.defineProperty(this, 'constructor', {
			get () {
				return ModificatorType;
			}
		});

		// modification itself
		// so now we have to copy all constructor props
		Object.assign(ModificatorType.prototype, ModificatorTypePrototype);
		// and set the prototype inherited
		Object.setPrototypeOf(ModificatorType.prototype, this);
		
		return ModificatorType;
	};
	
	Mnemosyne[SymbolConstructorName] = MNEMOSYNE;
	Mnemosyne.prototype = existentInstance;	
	
	return new Mnemosyne;
	
};

module.exports = CreateInstanceModificator;