'use strict';

const {
	odp,
	
	SymbolConstructorName,

	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	
} = require('../../const');

const CreateInstanceModificatorAncient200XthWay = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st existentInstance in prototype chain
	// ["Symbol(Defined Constructor Name)"] === "Mnemosyne"
	const existentInstance = this;
	
	if (!existentInstance || !existentInstance.constructor) {
		throw new Error(WRONG_MODIFICATION_PATTERN);
	}
	
	if (existentInstance instanceof ModificatorType) {
		throw new Error(WRONG_INSTANCE_INVOCATION);
	}
	
	// const BaseInstanceProto = Object.getPrototypeOf(this);
	// const BaseInstanceConstructor = this.constructor;
	// const BaseInstanceConstructorPrototype = this.constructor.prototype;
	
	// O Great Mnemosyne! Please!
	// Save us from Oblivion...
	// https://en.wikipedia.org/wiki/Mnemosyne
	const Mnemosyne = function () {

		// so now we have to copy all the inherited props
		// to "this", leaving them untouched in future
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			if (!this[name]) {
				this[name] = value;
			}
		});
		
		// about to setup constructor property for new instance
		odp(this, 'constructor', {
			get () {
				return ModificatorType;
			}
		});

		// give modification itself
		ModificatorType.prototype = this;
		return ModificatorType;
	};
	
	Mnemosyne[SymbolConstructorName] = 'Mnemosyne';
	Mnemosyne.prototype = existentInstance;

	return new Mnemosyne();
	
};

module.exports = CreateInstanceModificatorAncient200XthWay;