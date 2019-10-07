'use strict';

module.exports = function () {

	const CreateInstanceModificatorAncient200XthWay = function (ModificatorType, ModificatorTypePrototype) {
		
		const existentInstance = this;
		// For the 1st existentInstance in prototype chain
		// ["Symbol(Defined Constructor Name)"] === MNEMOSYNE
		
		// const BaseInstanceProto = Object.getPrototypeOf(this);
		// const BaseInstanceConstructor = this.constructor;
		// const BaseInstanceConstructorPrototype = this.constructor.prototype;
		const TripleSchemeClosure = function () {
			
			const inherited = this;
			
			// about to setup constructor property for new instance
			Object.defineProperty(inherited, 'constructor', {
				get () {
					return ModificatorType;
				}
			});
			
			const Mnemosyne = function () {
				
				const moreInherited = this;
				// so now we have to copy all the inherited props
				// to "this", leaving them untouched in future
				Object.entries(ModificatorTypePrototype).forEach((entry) => {
					const [name, value] = entry;
					moreInherited[name] = value;
				});
				
				// give modification itself
				ModificatorType.prototype = moreInherited;
				return ModificatorType;
				
			};
			
			// here "this" refers to an existent instance
			Mnemosyne.prototype = inherited;
		
			return new Mnemosyne();
		};
		
		TripleSchemeClosure.prototype = existentInstance;
		return new TripleSchemeClosure();
		
	};

	return CreateInstanceModificatorAncient200XthWay;
	
};