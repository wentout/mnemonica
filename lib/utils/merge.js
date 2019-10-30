'use strict';

const {
	MNEMONICA,
	SymbolConstructorName
} = require('../constants');

const {
	WRONG_ARGUMENTS_USED
} = require('../errors');

module.exports = (a, b) => {
	
	// at this situation this check is enough
	if (a !== Object(a)) {
		throw new WRONG_ARGUMENTS_USED('A should be an object');
	}
	
	// at this situation this check is enough
	if (b !== Object(b)) {
		throw new WRONG_ARGUMENTS_USED('B should be an object');
	}

	const aa = a.clone;
	if (typeof aa.extract !== 'function') {
		throw new WRONG_ARGUMENTS_USED('A should have A.extract()');
	}
	Object.assign(aa, aa.extract());

	Object.setPrototypeOf(aa, b);
	
	return aa;

};
