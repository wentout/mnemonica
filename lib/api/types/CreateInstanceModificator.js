'use strict';

const {
	odp,
	
	SymbolConstructorName,

	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	
} = require('../../const');

// so we should create function
// which will return proper constructor
// of modificatorType constructors
// inherited from existent instance
// meaning existent instance is "this" keyword
const CreateInstanceModificator = function (ModificatorType) {
	
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
	
	// Object.getPrototypeOf(this) == existentInstance; // true
	// this instanceof UpperClosureType // true
	// so "this" is already inherited from "existentInstance"
	
	// so, this is an "ExistentInstance" constructor of getExistentInstance
	// const BaseInstanceProto = Object.getPrototypeOf(this);
	// const BaseInstanceConstructor = this.constructor;
	// const BaseInstanceConstructorPrototype = this.constructor.prototype;
	
	// O Great Mnemosyne! Please!
	// Save us from Oblivion...
	// https://en.wikipedia.org/wiki/Mnemosyne
	const Mnemosyne = function (...args) {
		
		// make modification itself
		// Object.setPrototypeOf(ModificatorType.prototype, existentInstance);
		Object.setPrototypeOf(ModificatorType.prototype, this);
		// ModificatorType.prototype = this;
		const inheritedInstance = new ModificatorType(...args);
		
		// leaving inheritedInstance.constructor.name untouched
		// so, this will save Prototype Chain itself
		odp(inheritedInstance, 'constructor', {
			get () {
				return ModificatorType;
			}
		});
		return inheritedInstance;
	};
	Mnemosyne[SymbolConstructorName] = 'Mnemosyne';
	// we might not be using this,
	// but this is really very funny
	// it is how all that stuff was done before
	// when there was no Object.setPrototypeOf
	// there was a triple-inheritance scheme
	// which allowed you to make that stuff working
	// so... I'd prefere leave it here, for history
	Mnemosyne.prototype = existentInstance;
	
	return Mnemosyne;
	
};

module.exports = CreateInstanceModificator;