'use strict';

const {
	WRONG_MODIFICATION_PATTERN,
	WRONG_ARGUMENTS_USED
} = require('../errors');

const {
	SymbolGaia
} = require('../constants');

const extract = require('./extract');

const parse = (self) => {
	
	if (!self || !self.constructor) {
		throw new WRONG_MODIFICATION_PATTERN;
	}

	const proto = Object.getPrototypeOf(self);

	if (self.constructor.name !== proto.constructor.name) {
		throw new WRONG_ARGUMENTS_USED('have to use "instance" itself');
	}

	const protoProto = Object.getPrototypeOf(proto);
	if (protoProto && proto.constructor.name !== protoProto.constructor.name) {
		throw new WRONG_ARGUMENTS_USED('have to use "instance" itself');
	}

	// const args = self[SymbolConstructorName] ?
	// self[SymbolConstructorName].args : [];

	const { name } = proto.constructor;

	const props = extract({ ...self });
	// props.constructor = undefined;
	delete props.constructor;

	const joint = extract(Object.assign({}, proto));
	delete joint.constructor;

	const tree = {

		name,

		props,
		// the line below copy symbols also

		self,
		proto,

		joint
		// args,

	};
	
	if (protoProto.hasOwnProperty(SymbolGaia)) {
		tree.parent = protoProto;
		tree.gaia = self[SymbolGaia];
		return tree;
	// }
	// if (protoProto === null) {
	// 	tree.parent = protoProto;
	} else {
		tree.parent = parse(Object.getPrototypeOf(protoProto));
		tree.gaia = tree.parent.gaia;
	}

	return tree;
};

module.exports = parse;
