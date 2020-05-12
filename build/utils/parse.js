'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.parse = void 0;
const errors_1 = require('../descriptors/errors');
const { WRONG_MODIFICATION_PATTERN, WRONG_ARGUMENTS_USED } = errors_1.ErrorsTypes;
const constants_1 = require('../constants');
const { SymbolGaia } = constants_1.constants;
const extract_1 = require('./extract');
const hop_1 = require('./hop');
exports.parse = (self) => {
    if (!self || !self.constructor) {
        throw new WRONG_MODIFICATION_PATTERN;
    }
    const proto = Reflect.getPrototypeOf(self);
    if (self.constructor.name !== proto.constructor.name) {
        throw new WRONG_ARGUMENTS_USED('have to use "instance" itself');
    }
    const protoProto = Reflect.getPrototypeOf(proto);
    if (protoProto && proto.constructor.name !== protoProto.constructor.name) {
        throw new WRONG_ARGUMENTS_USED('have to use "instance" itself');
    }
    // const args = self[SymbolConstructorName] ?
    // self[SymbolConstructorName].args : [];
    const { name } = proto.constructor;
    const props = extract_1.extract(Object.assign({}, self));
    // props.constructor = undefined;
    delete props.constructor;
    const joint = extract_1.extract(Object.assign({}, proto));
    delete joint.constructor;
    let parent, gaia;
    if (hop_1.hop(protoProto, SymbolGaia)) {
        parent = protoProto;
        gaia = self[SymbolGaia];
    }
    else {
        parent = exports.parse(Reflect.getPrototypeOf(protoProto));
        // eslint-disable-next-line prefer-destructuring
        gaia = parent.gaia;
    }
    return {
        name,
        props,
        // the line below copy symbols also
        self,
        proto,
        joint,
        // args,
        parent,
        gaia
    };
};
