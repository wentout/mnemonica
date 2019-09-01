'use strict';

const {

	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	
} = require('../../const');

// so we should create function
// which will return proper constructor
// inherited from existent instance

const CreateInstanceModificator = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st child : Type Itself
	// it referes to "MnemonicaBase"
	// [""Symbol(Defined Constructor Name)""] : "MnemonicaBase"
	const existentInstance = this;
	
	if (!existentInstance || !existentInstance.constructor) {
		throw new Error(WRONG_MODIFICATION_PATTERN);
	}
	
	if (existentInstance instanceof ModificatorType) {
		throw new Error(WRONG_INSTANCE_INVOCATION);
	}
	
	// so now we have to copy all constructor props
	Object.assign(ModificatorType.prototype, ModificatorTypePrototype);
	// and set the prototype inherited
	Object.setPrototypeOf(ModificatorType.prototype, existentInstance);
	return ModificatorType;
	
};

module.exports = CreateInstanceModificator;