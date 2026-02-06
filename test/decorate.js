"use strict";
// npx tsc --sourceMap ./test/decorate.ts
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.midAddDecoratorSubExt = exports.midAddDecoratorBaseExt = exports.midDecoratorExt = exports.midDecoratorBase = exports.exSupTest = exports.exTest = exports.myOtherInstance = exports.myDecoratedSubSubInstance = exports.myDecoratedSubInstance = exports.myDecoratedInstance2 = exports.myDecoratedInstance = void 0;
// fails on loading sourcemap ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap --inlineSources ./test/decorate.ts
// works ↓↓↓
// npx tsc --target es6 --moduleResolution NodeNext --module NodeNext --sourceMap ./test/decorate.ts
const __1 = require("..");
const typeomatica_1 = require("typeomatica");
// debugger;
const deep = { deep: true };
class Base {
    constructor() {
        this.base_field = 555;
    }
}
class Some extends Base {
    constructor() {
        super(...arguments);
        this.field = 333;
    }
}
Object.setPrototypeOf(Base.prototype, new typeomatica_1.BaseClass(deep));
const some = new Some;
console.log(some);
// @ts-ignore
console.log('some.deep', some.deep);
let SBase = (() => {
    let _classDecorators = [(0, typeomatica_1.Strict)(deep)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SBase = _classThis = class {
        constructor() {
            this.base_field = 555;
        }
    };
    __setFunctionName(_classThis, "SBase");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SBase = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SBase = _classThis;
})();
class SomeS extends SBase {
    constructor() {
        super(...arguments);
        this.field = 333;
    }
}
const somes = new SomeS;
console.log(somes);
// @ts-ignore
console.log('somes.deep', somes.deep);
// debugger;
// @ts-ignore
class BaseE extends typeomatica_1.BaseClass {
    constructor() {
        super(...arguments);
        this.base_field = 555;
    }
}
// @ts-ignore
class SomeE extends BaseE {
    constructor() {
        super(...arguments);
        this.field = 333;
    }
}
const esome = new SomeE;
console.log(esome);
// debugger;
let MyDecoratedClass = (() => {
    let _classDecorators = [(0, __1.decorate)({ blockErrors: true }), (0, typeomatica_1.Strict)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MyDecoratedClass = _classThis = class {
        constructor() {
            // // debugger;
            // super();
            // // debugger;
            this.field = 123;
        }
    };
    __setFunctionName(_classThis, "MyDecoratedClass");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyDecoratedClass = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyDecoratedClass = _classThis;
})();
// debugger;
const immediateInstance = new MyDecoratedClass;
console.log(immediateInstance);
let MyDecoratedSubClass = (() => {
    let _classDecorators = [(0, __1.decorate)(MyDecoratedClass, { strictChain: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MyDecoratedSubClass = _classThis = class {
        constructor() {
            this.sub_field = 321;
        }
    };
    __setFunctionName(_classThis, "MyDecoratedSubClass");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyDecoratedSubClass = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyDecoratedSubClass = _classThis;
})();
// debugger;
exports.myDecoratedInstance = new MyDecoratedClass;
exports.myDecoratedInstance2 = new MyDecoratedClass;
exports.myDecoratedSubInstance = (0, __1.apply)(exports.myDecoratedInstance, MyDecoratedSubClass);
// debugger;
const MyFn = function () {
    this.sub_sub_field = 123;
};
// TODO: this can not be done on a sub-class
// check if parent class is not decorated
// check if this is invocation for extended class
// throw an error if yes
// Object.setPrototypeOf(MyFn.prototype, new BaseClass);
let MyDecoratedSubSubClass = (() => {
    let _classDecorators = [(0, __1.decorate)(MyDecoratedSubClass)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = MyFn;
    var MyDecoratedSubSubClass = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.sub_sub_field = 321;
        }
    };
    __setFunctionName(_classThis, "MyDecoratedSubSubClass");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyDecoratedSubSubClass = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyDecoratedSubSubClass = _classThis;
})();
exports.myDecoratedSubSubInstance = (0, __1.apply)(exports.myDecoratedSubInstance, MyDecoratedSubSubClass);
// debugger;
let MyOtherDecoratedClass = (() => {
    let _classDecorators = [(0, __1.decorate)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = typeomatica_1.BaseClass;
    var MyOtherDecoratedClass = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.field = 123;
        }
    };
    __setFunctionName(_classThis, "MyOtherDecoratedClass");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MyOtherDecoratedClass = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MyOtherDecoratedClass = _classThis;
})();
// debugger;
const myOtherDecoratedInstance = new MyOtherDecoratedClass();
// debugger;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MyOtherFn = MyOtherDecoratedClass.define('MyOtherFn', function () {
    this.prop = 321;
});
// debugger;
exports.myOtherInstance = (0, __1.apply)(myOtherDecoratedInstance, MyOtherFn);
// debugger;
class ExtendTestingBase {
    constructor() {
        this.field = 333;
    }
}
let ExtendTestingExt = (() => {
    let _classDecorators = [(0, __1.decorate)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = ExtendTestingBase;
    var ExtendTestingExt = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.field = 111;
        }
    };
    __setFunctionName(_classThis, "ExtendTestingExt");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExtendTestingExt = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExtendTestingExt = _classThis;
})();
exports.exTest = new ExtendTestingExt;
// debugger;
let ExtendTestingSupBase = (() => {
    let _classDecorators = [(0, __1.decorate)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ExtendTestingSupBase = _classThis = class {
        constructor() {
            this.field = 333;
        }
    };
    __setFunctionName(_classThis, "ExtendTestingSupBase");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExtendTestingSupBase = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExtendTestingSupBase = _classThis;
})();
class ExtendTestingSupExt extends ExtendTestingSupBase {
    constructor() {
        super(...arguments);
        this.field = 111;
    }
}
exports.exSupTest = new ExtendTestingSupExt;
// debugger;
const MidDecorator = (() => {
    let _classDecorators = [(0, __1.decorate)({ strictChain: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MidDecoratorBase = _classThis = class {
        constructor() {
            this.field = 333;
        }
    };
    __setFunctionName(_classThis, "MidDecoratorBase");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MidDecoratorBase = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MidDecoratorBase = _classThis;
})();
// @ts-ignore
let MidDecoratorExt = (() => {
    let _classDecorators = [MidDecorator()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MidDecoratorExt = _classThis = class {
        constructor() {
            this.field = 111;
            console.log('im here: ', this.field);
        }
    };
    __setFunctionName(_classThis, "MidDecoratorExt");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MidDecoratorExt = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MidDecoratorExt = _classThis;
})();
// @ts-ignore
const MidAddDecorator = (() => {
    let _classDecorators = [MidDecorator()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MidAddDecoratorAddExt = _classThis = class {
        constructor() {
            this.field = 111;
            console.log('im here: ', this.field);
        }
    };
    __setFunctionName(_classThis, "MidAddDecoratorAddExt");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MidAddDecoratorAddExt = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MidAddDecoratorAddExt = _classThis;
})();
// debugger;
// @ts-ignore
const MidAddDecoratorSub = (() => {
    let _classDecorators = [MidAddDecorator({ test: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MidAddDecoratorAddExtSub = _classThis = class {
        constructor() {
            this.field = 111;
            console.log('im here: ', this.field);
        }
    };
    __setFunctionName(_classThis, "MidAddDecoratorAddExtSub");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MidAddDecoratorAddExtSub = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MidAddDecoratorAddExtSub = _classThis;
})();
// debugger;
exports.midDecoratorBase = new MidDecorator;
// debugger;
exports.midDecoratorExt = (0, __1.apply)(exports.midDecoratorBase, MidDecoratorExt);
// debugger;
exports.midAddDecoratorBaseExt = (0, __1.apply)(exports.midDecoratorBase, MidAddDecorator);
try {
    debugger;
    (0, __1.apply)(exports.midDecoratorBase, MidAddDecoratorSub);
}
catch (error) {
    // wow
    // this is either TS transpilation based
    // or some prototype pollution 
    // though, if it will be pollution,
    /// then all the tests will become broken
    // and this is not what happens
    console.error(error);
}
debugger;
exports.midAddDecoratorSubExt = (0, __1.apply)(exports.midAddDecoratorBaseExt, MidAddDecoratorSub);
debugger;
//# sourceMappingURL=decorate.js.map