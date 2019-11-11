'use strict';

const {
	SymbolConstructorName,
} = require('../../constants');

const {
	WRONG_TYPE_DEFINITION,
} = require('../../errors');

const {
	collectConstructors
} = require('../../utils');


const CreationHandler = function (constructionAnswer) {
	// standard says : 
	// if constructor returns something
	// then this is a toy
	// we have to play with
	// respectively
	// so we will not follow the rule
	// if (constructionAnswer instanceof types[TypeName]) {
	// and instead follow the line below
	if (constructionAnswer instanceof Object) {
		return constructionAnswer;
	}
	return this;
};

const
	oldMC = require('./createInstanceModificator200XthWay'),
	newMC = require('./createInstanceModificator');

const getModificationConstructor = (useOldStyle) => {
	return (useOldStyle ? oldMC : newMC)();
};

const checkProto = (proto) => {
	if (!(proto instanceof Object)) {
		throw new WRONG_TYPE_DEFINITION('expect prototype to be an object');
	}
};

const getTypeChecker = (TypeName) => {
	return (instance) => {
		if (!instance) {
			return false;
		}
		if (!instance.constructor) {
			return false;
		}
		if (instance instanceof Promise) {
			return instance[SymbolConstructorName] === TypeName;
		}
		const constructors = collectConstructors(instance);
		return constructors[TypeName] || false;
	};
};

const getTypeSplitPath = (path) => {
	const split = path
		// beautifull names
		.replace(/\n|\t| /g, '')
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/^\./, '')
		.split(/\.|\/|:/);
	return split;
};

const getStack = (title, stackAddition) => {

	let {
		stack
	} = (new Error);

	const split = stack.split('\n');
	stack = split.slice(1).reduce((arr, line) => {
		if (line.indexOf(__dirname) < 0) {
			arr.push(line);
		}
		return arr;
	}, []);

	stack.unshift(title);
	stackAddition && stack.push(...stackAddition);
	stack.push('\n');
	stack = stack.join('\n');

	return stack;

};

const getExistentStack = (existentInstance) => {

	const stack = [];

	let proto = existentInstance;
	while (proto) {
		// if (proto && proto.__stack__) {
		const pstack = proto.__stack__
			.split('\n')
			.reduce((arr, line) => {
				if (line.length) {
					arr.push(line);
				}
				return arr;
			}, []);

		proto = proto.parent();
		if (proto && proto.__type__) {
			if (proto.__type__.isSubType) {
				stack.push(...pstack.slice(0, 1));
			} else {
				stack.push(...pstack);
			}
		} else {
			stack.push(...pstack);
			break;
		}
		// }
	}

	return stack;

};

module.exports = {
	CreationHandler,
	getModificationConstructor,
	checkProto,
	getTypeChecker,
	getTypeSplitPath,
	getStack,
	getExistentStack,
};
