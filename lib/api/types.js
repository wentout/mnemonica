'use strict';

const {
	types : defaultTypes
} = require('../descriptors/types');

const {
	odp,
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	ALREADY_DECLARED,
} = require('../const');

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
};


const compileNewModificatorFunctionBody = function (FunctionName) {
	return new Function('ConstructHandler', 'CreationHandler', 'proto', 'SymbolConstructorName',
	`
		const ${FunctionName} = function ${FunctionName} (...args) {
			const answer = ConstructHandler.call(this, ...args);
			return CreationHandler.call(this, answer);
		};
		
		${FunctionName}[SymbolConstructorName] = '${FunctionName}';
		${FunctionName}.prototype = proto;
		
		return ${FunctionName};
	`);
};


// TODO : !!! cleanup this mess !!!
const CreateInstanceModificator = function (existentInstance = Object.create({}), ModificatorType) {
	
	// TODO: might be I shall use existentInstance = this;
	
	if (!existentInstance || !existentInstance.constructor) {
		throw new Error(WRONG_MODIFICATION_PATTERN);
	}
	
	if (existentInstance instanceof ModificatorType) {
		throw new Error(WRONG_INSTANCE_INVOCATION);
	}
	
	const ModificatorTypeProto = ModificatorType.prototype;
	
	const DataModificatorInheridedType = function () {
		
		const UpperClosureType = function () {
		
			const willBeModifiedInstance = this;
			
			const ModificatorInheridedType = function (...args) {
				
				ModificatorType.prototype = this;
				const inheritedInstance = new ModificatorType(...args);
				
				// // // leaving inheritedInstance.constructor.prototype untouched
				Object.defineProperty(inheritedInstance, 'constructor', {
					value : ModificatorType,
					// TODO : !!! comment and understnd
					writable : true
				});
				
				Object.defineProperty(inheritedInstance.constructor, 'prototype', {
					value : ModificatorInheridedType.prototype
				});
				
				return inheritedInstance;
			};
			
			ModificatorInheridedType.prototype = willBeModifiedInstance;
			
			Object.defineProperty(ModificatorInheridedType.prototype, 'constructor', {
				value : ModificatorInheridedType,
				// TODO : !!! comment and understnd
				writable : true
			});
			
			Object.entries(ModificatorTypeProto).forEach(([key, value] = entry) => {
				if (!ModificatorInheridedType.prototype.hasOwnProperty(key)) {
					ModificatorInheridedType.prototype[key] = undefined;
					ModificatorInheridedType.prototype[key] = ModificatorTypeProto[key];
				}
			});
			
			return ModificatorInheridedType;
		
		};
		
		UpperClosureType.prototype = this;
		
		return new UpperClosureType();
		
	};
	
	DataModificatorInheridedType.prototype = existentInstance;
	const dataModificatorInstance = new DataModificatorInheridedType();
	
	return dataModificatorInstance;
	
};


const addSubTypes = (inheritedInstance, subtypes) => {
	
	Object.entries(subtypes).forEach(([name, SubTypeDescriptor] = entry) => {
		
		odp(inheritedInstance, name, {
			get () {
				return function (...args) {
					
					const InstanceModificator = CreateInstance.call(inheritedInstance, SubTypeDescriptor);
					InstanceModificator.prototype = inheritedInstance;
					
					const inheritedSubInstance = new InstanceModificator(...args);
					
					return inheritedSubInstance;
					
				};
			}
		});
	});
};

const SymbolSubtypeCollection = Symbol('SubType Collection');
const SymbolConstructorName = Symbol('Defined Constructor Name');

const collectConstructors = (self) => {
	if (!self.constructor) {
		throw new Error('InheritedInstance is not Defined!')
	}
	const constructors = {
		[self.constructor[SymbolConstructorName]] : true
	};
	let proto = Object.getPrototypeOf(self);
	while (proto) {
		if (proto) {
			constructors[proto.constructor[SymbolConstructorName]] = true;
			self = proto;
			proto = Object.getPrototypeOf(self);
		} else {
			break;
		}
	}
	return constructors;
};


const CreateInstance = function (TypeDescriptor, args) {
	
	const {
		ConstructHandler,
		TypeName,
		proto,
		subtypes,
		isSubType,
	} = TypeDescriptor;
	
	var InheritedInstance = isSubType ? this : Object.create({});
	
	if (!InheritedInstance) {
		throw new Error('InheritedInstance is not Defined!')
	}

	const CreationHandler = function (constructionAnswer) {
		addSubTypes(this, subtypes);
		return this;
	};
	
	const modificatorBody = compileNewModificatorFunctionBody(TypeName);
	const modificationConstructor = modificatorBody(ConstructHandler, CreationHandler, proto, SymbolConstructorName);
	const InstanceModificator = CreateInstanceModificator(InheritedInstance, modificationConstructor);
	
	if (isSubType) {
		return InstanceModificator;
	}
	
	const inheritedInstance = new InstanceModificator(...args);
	
	
	return inheritedInstance;
	
};

const DefineSubType = function (...args) {
	
	// this; // binded to TypeDescriptor
	
	const SubTypeProxy = define.call(this.subtypes, ...args);
	return SubTypeProxy;
};


const defineFromFunction = function (
	TypeName,
	ConstructHandler = function () {
		return this;
	},
	proto = {},
) {
	
	const types = this;
	
	const isSubType = types[SymbolSubtypeCollection];
	
	if (typeof TypeName !== 'string') {
		throw new Error(TYPENAME_MUST_BE_A_STRING);
	}
	
	if (typeof ConstructHandler !== 'function') {
		throw new Error(HANDLER_MUST_BE_A_FUNCTION);
	}
	
	if (types[TypeName]) {
		throw new Error(ALREADY_DECLARED);
	}
	
	checkProto(proto);
	
	const subtypes = {};
	
	
	const ModificatorTypeDescriptorTitle = `constructor of : ${TypeName}`;
	
	const TypeDescriptor = {
		
		ConstructHandler,
		TypeName,
		proto,
		
		isSubType,
		subtypes,
		
		meta : {
			name : TypeName,
			title : ModificatorTypeDescriptorTitle,
		}
	};
	
	odp(subtypes, SymbolSubtypeCollection, {
		get () {
			return TypeDescriptor;
		}
	});
	
	odp(types, TypeName, {
		enumerable : true,
		get () {
			return TypeDescriptor;
		},
	});
	
	const typeProxyConstructMethod = function (target, args) {
		// this; // referenced to TypeProxy
		return CreateInstance(TypeDescriptor, args);
	};
	
	const typeProxyGetterMethod = function (target, prop) {
		if (prop == 'define') {
			// this; // referenced to TypeProxy
			const SubTypeProxy = DefineSubType.bind(TypeDescriptor);
			return SubTypeProxy;
		}
		
		if (prop === Symbol.hasInstance) {
			return (instance) => {
				if (!instance.constructor) {
					return false;
				}
				const constructors = collectConstructors(instance);
				return constructors[TypeName] || false;
			};
		}
		
		return target[prop];
	};
	
	const TypeProxy = new Proxy(ConstructHandler, {
		construct : typeProxyConstructMethod,
		get : typeProxyGetterMethod
	});
	
	return TypeProxy;
	
};

const defineFromType = function (GetConstructHandler) {
	
	const types = this;
	
	const type = GetConstructHandler();
	const TypeName = type.name;
	
	if (!TypeName) {
		throw new Error(TYPENAME_MUST_BE_A_STRING);
	}
	
	if (types[TypeName]) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
	
	const proto = type.prototype;
	
	return defineFromFunction.call(types, TypeName, type, proto);
	
};


const define = function (TypeOrTypeName, ...args) {
	const types = this;
	let definitor = null;
	if (typeof TypeOrTypeName === 'string') {
		return defineFromFunction.call(types, TypeOrTypeName, ...args);
	}
	if (typeof TypeOrTypeName === 'function') {
		return defineFromType.call(types, TypeOrTypeName, ...args);
	}
	if (definitor === null) {
		throw new Error(WRONG_TYPE_DEFINITION);
	}
	return definitor.call(types, TypeOrTypeName, ...args);
};


module.exports = {
	define : define.bind(defaultTypes)
};