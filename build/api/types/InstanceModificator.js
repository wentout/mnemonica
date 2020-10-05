'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.makeInstanceModificator = void 0;
const InstanceCreatorProto_1 = require('./InstanceCreatorProto');
exports.makeInstanceModificator = (self) => {
	const { ModificationConstructor, existentInstance, ModificatorType, proto, } = self;
	const result = ModificationConstructor.call(existentInstance, ModificatorType, Object.assign({}, proto), (__proto_proto__) => {
		self.__proto_proto__ = __proto_proto__;
		InstanceCreatorProto_1.proceedProto.call(self);
	});
	return result;
};
