'use strict';

const {
	SymbolConstructorName,
} = require('../constants');

const {
	WRONG_MODIFICATION_PATTERN,
	WRONG_ARGUMENTS_USED
} = require('../errors');

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
	const tree = {
		
		name,
		
		props :  { ...self },
		// the line below copy symbols also
		joint : Object.assign({}, proto),
		
		self,
		proto,
		
		// args,
		
	};

	// line below is the same as
	//  if (name === 'Object') {
	// but in more communicative form
	if (protoProto === null) {
		const result = {};
		Object.defineProperty(result, SymbolConstructorName, {
			get () {
				return self[SymbolConstructorName];
			}
		});
		return result;
	}
	
	tree.parent = parse(Object.getPrototypeOf(protoProto));

	return tree;
};

module.exports = parse;
