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


const getTypeSplitPath = (path) => {
	const split = path
		// beautifull names
		.replace(/\n|\t| /g, '')
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/^\./, '')
		.split(/\.|\/|:/);
	return split;
};

module.exports = {
	getModificationConstructor,
	checkProto,
	getTypeChecker,
	CreationHandler,
	getTypeSplitPath
};
