'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInstanceModificator = void 0;
const addProps_1 = require("./addProps");
const makeInstanceModificator = (self) => {
    const { ModificationConstructor, existentInstance, ModificatorType, proto, } = self;
    const result = ModificationConstructor.call(existentInstance, ModificatorType, Object.assign({}, proto), (__proto_proto__) => {
        self.__proto_proto__ = __proto_proto__;
        addProps_1.addProps.call(self);
    });
    return result;
};
exports.makeInstanceModificator = makeInstanceModificator;
//# sourceMappingURL=InstanceModificator.js.map