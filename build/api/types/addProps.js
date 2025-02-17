'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProps = void 0;
const constants_1 = require("../../constants");
const { odp, } = constants_1.constants;
const addProps = function () {
    const self = this;
    const { type, existentInstance, args, config: { submitStack }, __proto_proto__: proto } = self;
    const { collection, subtypes, } = type;
    odp(proto, '__proto_proto__', {
        get() {
            return proto;
        }
    });
    odp(proto, '__args__', {
        get() {
            return args;
        }
    });
    odp(proto, '__collection__', {
        get() {
            return collection;
        }
    });
    odp(proto, '__subtypes__', {
        get() {
            return subtypes;
        }
    });
    odp(proto, '__type__', {
        get() {
            return type;
        }
    });
    odp(proto, '__parent__', {
        get() {
            return existentInstance;
        }
    });
    if (submitStack) {
        const { stack } = this;
        odp(proto, '__stack__', {
            get() {
                return stack.join('\n');
            }
        });
    }
    odp(proto, '__creator__', {
        get() {
            return self;
        }
    });
    const timestamp = Date.now();
    odp(proto, '__timestamp__', {
        get() {
            return timestamp;
        }
    });
};
exports.addProps = addProps;
module.exports = {
    addProps: exports.addProps
};
//# sourceMappingURL=addProps.js.map