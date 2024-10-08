'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const errors_1 = require("../descriptors/errors");
const { WRONG_MODIFICATION_PATTERN, WRONG_ARGUMENTS_USED } = errors_1.ErrorsTypes;
const constants_1 = require("../constants");
const { SymbolGaia } = constants_1.constants;
const extract_1 = require("./extract");
const hop_1 = require("./hop");
const parse = (self) => {
    if (!self || !self.constructor) {
        throw new WRONG_MODIFICATION_PATTERN;
    }
    const proto = Reflect.getPrototypeOf(self);
    if (self.constructor.name.toString() !== proto.constructor.name.toString()) {
        throw new WRONG_ARGUMENTS_USED(`have to use "instance" itself: '${self.constructor.name}' vs '${proto.constructor.name}'`);
    }
    const protoProto = Reflect.getPrototypeOf(proto);
    if (protoProto && proto.constructor.name.toString() !== protoProto.constructor.name.toString()) {
        throw new WRONG_ARGUMENTS_USED(`have to use "instance" itself: '${proto.constructor.name}' vs '${protoProto.constructor.name}'`);
    }
    const { name } = proto.constructor;
    const props = (0, extract_1.extract)(Object.assign({}, self));
    delete props.constructor;
    const joint = (0, extract_1.extract)(Object.assign({}, proto));
    delete joint.constructor;
    let parent;
    let gaia;
    if ((0, hop_1.hop)(protoProto, SymbolGaia)) {
        parent = protoProto;
        gaia = self[SymbolGaia];
    }
    else {
        parent = (0, exports.parse)(Reflect.getPrototypeOf(protoProto));
        gaia = parent.gaia;
    }
    return {
        name,
        props,
        self,
        proto,
        joint,
        parent,
        gaia
    };
};
exports.parse = parse;
//# sourceMappingURL=parse.js.map