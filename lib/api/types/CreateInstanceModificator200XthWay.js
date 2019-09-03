'use strict';

const {
	odp,
	
	SymbolConstructorName,
	MNEMOSYNE,
	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	
} = require('../../const');

const CreateInstanceModificatorAncient200XthWay = function (ModificatorType, ModificatorTypePrototype) {
	
	// For the 1st existentInstance in prototype chain
	// ["Symbol(Defined Constructor Name)"] === MNEMOSYNE
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
	
	const Mnemosyne = function () {
			
		// about to setup constructor property for new instance
		odp(this, 'constructor', {
			get () {
				return ModificatorType;
			}
		});

		// give modification itself
		ModificatorType.prototype = this;
		
		// so now we have to copy all the inherited props
		// to "this", leaving them untouched in future
		Object.entries(ModificatorTypePrototype).forEach((entry) => {
			const [name, value] = entry;
			if (!this[name]) {
				this[name] = value;
			} else {
				// for properties that are getters
				if (!this.hasOwnProperty(name)) {
					odp(this, name, {
						get () {
							return value;
						}
					});
				}
			}
		});
		
		return ModificatorType;

	};
	
	Mnemosyne[SymbolConstructorName] = MNEMOSYNE;
	Mnemosyne.prototype = existentInstance;

	return new Mnemosyne();
	
};

module.exports = CreateInstanceModificatorAncient200XthWay;