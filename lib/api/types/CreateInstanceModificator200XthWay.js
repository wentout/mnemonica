'use strict';

const {
	odp,
	
	SymbolConstructorName,

	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	
} = require('../../const');

const CreateInstanceModificatorAncient200XthWay = function (ModificatorType) {
	
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
	
	const ModificatorTypePrototype = ModificatorType.prototype;
	
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
		// Object.setPrototypeOf(ModificatorType.prototype, this);
		ModificatorType.prototype = this;
		const inheritedInstance = new ModificatorType(...args);
		
		// leaving inheritedInstance.constructor.name untouched
		// so, this will save Prototype Chain itself
		odp(inheritedInstance, 'constructor', {
			get () {
				return ModificatorType;
			}
		});
		// so now we have to copy all the inherited props
		// to our new instance prototype, to leave them untouched
		Object.assign(inheritedInstance.constructor.prototype, ModificatorTypePrototype);

		return inheritedInstance;
	};
	Mnemosyne[SymbolConstructorName] = 'Mnemosyne';

	// const MnemosyneProto = Object.getPrototypeOf(Mnemosyne);
	// const MnemosynePrototype = Mnemosyne.prototype;
	// >>> Mnemosyne.prototype !== Mnemosyne.constructor.prototype <<< !!!
	// const MnemosyneConstructor = Mnemosyne.constructor;
	// const MnemosyneConstructorPrototype = Mnemosyne.constructor.prototype;

	// so, now "this" inside of UpperClosure
	// will be inherited from existentInstance
	// and all we have to do is extend it with props
	// from ModificatorType.prototype

	Mnemosyne.prototype = this;

	return Mnemosyne;
	
};

module.exports = CreateInstanceModificatorAncient200XthWay;