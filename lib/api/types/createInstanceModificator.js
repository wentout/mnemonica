'use strict';

const {
	SymbolConstructorName
} = require('../../constants');

// so we should create function
// which will return proper constructor
// inherited from existent instance

const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype, NamespaceName) {
	
	// For the 1st child : Type Itself
	// it referes to "MnemonicaBase"
	// [""Symbol(Defined Constructor Name)""] : "MnemonicaBase"
	
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
		
		ModificatorType[SymbolConstructorName] = this;
		return ModificatorType;
	};
	
	Mnemosyne[SymbolConstructorName] = NamespaceName;
	// here "this" refers to an existent instance
	Mnemosyne.prototype = this;
	
	return new Mnemosyne;
	
};

module.exports = CreateInstanceModificator;