'use strict';

const {
	WRONG_INSTANCE_INVOCATION
} = require('../errors');

module.exports = (instance, ...args) => {

	// at this situation this check is enough
	if (instance !== Object(instance)) {
		throw new WRONG_INSTANCE_INVOCATION;
	}

	const props = args.reduce((arr, el) => {
		if (Array.isArray(el)) {
			arr.push(...el);
		} else {
			arr.push(el);
		}
		return arr;
	}, []);

	const picked = props.reduce((obj, name) => {
		obj[name] = instance[name];
		return obj;
	}, {});

	return picked;

};
