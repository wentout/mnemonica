'use strict';

const {
	
	SymbolConstructorName,
	MNEMOSYNE,
	
} = require('../../constants');

const CreateInstanceModificatorAncient200XthWay = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st existentInstance in prototype chain
	// ["Symbol(Defined Constructor Name)"] === MNEMOSYNE
	
	// const BaseInstanceProto = Object.getPrototypeOf(this);
	// const BaseInstanceConstructor = this.constructor;
	// const BaseInstanceConstructorPrototype = this.constructor.prototype;
	
	const Mnemosyne = function () {
			
		// about to setup constructor property for new instance
		Object.defineProperty(this, 'constructor', {
			get () {
				return ModificatorType;
			}
		});
		
		// so now we have to copy all the inherited props
		// to "this", leaving them untouched in future
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			this[name] = value;
		});
		
		// give modification itself
		ModificatorType.prototype = this;
		// ModificatorType.prototype.constructor = ModificatorType;
		
		return ModificatorType;

	};
	
	Mnemosyne[SymbolConstructorName] = MNEMOSYNE;
	// here "this" refers to an existent instance
	Mnemosyne.prototype = this;

	return new Mnemosyne();
	
};

module.exports = CreateInstanceModificatorAncient200XthWay;