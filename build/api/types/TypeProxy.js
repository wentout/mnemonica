'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeProxy = void 0;
const utils_1 = require("../utils");
const { checkProto, } = utils_1.default;
const hop_1 = require("../../utils/hop");
const errors_1 = require("../../descriptors/errors");
const { WRONG_TYPE_DEFINITION, } = errors_1.ErrorsTypes;
const Mnemosyne_1 = require("./Mnemosyne");
const { createMnemosyne } = Mnemosyne_1.default;
const InstanceCreator_1 = require("./InstanceCreator");
exports.TypeProxy = function (__type__, Uranus) {
    Object.assign(this, {
        __type__,
        Uranus
    });
    const typeProxy = new Proxy(InstanceCreator_1.InstanceCreator, this);
    return typeProxy;
};
exports.TypeProxy.prototype.get = function (target, prop) {
    const { __type__: type } = this;
    if (prop === 'prototype') {
        return type.proto;
    }
    const propDeclaration = type[prop];
    if (propDeclaration) {
        return propDeclaration;
    }
    if ((0, hop_1.hop)(type, prop)) {
        return propDeclaration;
    }
    if (type.subtypes.has(prop)) {
        return type.subtypes.get(prop);
    }
    return Reflect.get(target, prop);
};
exports.TypeProxy.prototype.set = function (__, name, value) {
    const { __type__: type } = this;
    if (name === 'prototype') {
        checkProto(value);
        type.proto = value;
        return true;
    }
    if (typeof name !== 'string' || !name.length) {
        throw new WRONG_TYPE_DEFINITION('should use non empty string as TypeName');
    }
    if (typeof value !== 'function') {
        throw new WRONG_TYPE_DEFINITION('should use function for type definition');
    }
    const TypeName = name;
    const Constructor = value;
    type.define(TypeName, Constructor);
    return true;
};
exports.TypeProxy.prototype.apply = function (__, Uranus, args) {
    const type = this.__type__;
    let instance = null;
    if (Uranus) {
        const InstanceCreatorProxy = new exports.TypeProxy(type, Uranus);
        instance = new InstanceCreatorProxy(...args);
    }
    else {
        instance = this.construct(null, args);
    }
    return instance;
};
exports.TypeProxy.prototype.construct = function (__, args) {
    const { __type__: type, Uranus } = this;
    const mnemosyneProxy = createMnemosyne(Uranus);
    const instance = new InstanceCreator_1.InstanceCreator(type, mnemosyneProxy, args);
    return instance;
};
//# sourceMappingURL=TypeProxy.js.map