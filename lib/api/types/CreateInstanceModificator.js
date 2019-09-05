'use strict';

const {
	odp,
	MNEMOSYNE,
	SymbolConstructorName
} = require('../../constants');

const {
	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
} = require('../../errors');


// so we should create function
// which will return proper constructor
// inherited from existent instance

const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st child : Type Itself
	// it referes to "MnemonicaBase"
	// [""Symbol(Defined Constructor Name)""] : "MnemonicaBase"
	const existentInstance = this;
	
	if (!existentInstance || !existentInstance.constructor) {
		throw new WRONG_MODIFICATION_PATTERN;
	}
	
	if (existentInstance instanceof ModificatorType) {
		throw new WRONG_INSTANCE_INVOCATION;
	}
	const Mnemosyne = function () {
			
		// about to setup constructor property for new instance
		odp(this, 'constructor', {
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