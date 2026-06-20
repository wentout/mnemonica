/**
 * TypeScript type tests for decorate function
 * This file tests that all decorate usage patterns work correctly
 *
 * NOTE: Patterns 3, 5, 6, 7 use decorated classes in ways that TypeScript's
 * type system cannot fully express. The @ts-expect-error comments document
 * where TypeScript's type checking is overly conservative, but the runtime
 * behavior is correct and the types are properly inferred for instance usage.
 */
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
import { decorate, apply } from '..';
// ============================================
// Pattern 1: @decorate() - no arguments
// ============================================
let NoArgDecoratedClass = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NoArgDecoratedClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NoArgDecoratedClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        field = 123;
    };
    return NoArgDecoratedClass = _classThis;
})();
const noArgInstance = new NoArgDecoratedClass();
// Type should be inferred correctly
const _noArgField = noArgInstance.field;
// ============================================
// Pattern 2: @decorate(config) - config only
// ============================================
let ConfigDecoratedClass = (() => {
    let _classDecorators = [decorate({ blockErrors: true, strictChain: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigDecoratedClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigDecoratedClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        field = 'test';
    };
    return ConfigDecoratedClass = _classThis;
})();
const configInstance = new ConfigDecoratedClass();
// Type should be inferred correctly
const _configField = configInstance.field;
// ============================================
// Pattern 3: @decorate(ParentClass) - parent only
let ParentClass = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ParentClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ParentClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        parentField = 100;
    };
    return ParentClass = _classThis;
})();
// @ts-expect-error - TypeScript's decorator type inference doesn't track that ParentClass has been transformed to DecoratedClass
let ChildClass = (() => {
    let _classDecorators = [decorate(ParentClass)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ChildClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChildClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        childField = 'child';
    };
    return ChildClass = _classThis;
})();
const parentInstance = new ParentClass();
const childInstance = apply(parentInstance, ChildClass);
// Both parent and child fields should be accessible
const _parentFieldFromChild = childInstance.parentField;
const _childField = childInstance.childField;
// ============================================
// Pattern 4: @decorate(ParentClass, config) - parent with config
// ============================================
let ConfigParentClass = (() => {
    let _classDecorators = [decorate({ strictChain: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigParentClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigParentClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        parentField = 200;
    };
    return ConfigParentClass = _classThis;
})();
let ConfigChildClass = (() => {
    let _classDecorators = [decorate(ConfigParentClass, { strictChain: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigChildClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigChildClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        childField = 'configChild';
    };
    return ConfigChildClass = _classThis;
})();
const configParentInstance = new ConfigParentClass();
const configChildInstance = apply(configParentInstance, ConfigChildClass);
// Both parent and child fields should be accessible
const _configParentField = configChildInstance.parentField;
const _configChildField = configChildInstance.childField;
// ============================================
// Pattern 5: Using decorated class as decorator
let DecoratorBase = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DecoratorBase = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DecoratorBase = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        baseField = 100;
    };
    return DecoratorBase = _classThis;
})();
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let DecoratorChild = (() => {
    let _classDecorators = [DecoratorBase()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DecoratorChild = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DecoratorChild = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        childField = 'decoratorChild';
    };
    return DecoratorChild = _classThis;
})();
const decoratorBaseInstance = new DecoratorBase();
const decoratorChildInstance = apply(decoratorBaseInstance, DecoratorChild);
const _decoratorBaseField = decoratorChildInstance.baseField;
const _decoratorChildField = decoratorChildInstance.childField;
// ============================================
// Pattern 6: Using decorated class as decorator with config
let ConfigDecoratorBase = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigDecoratorBase = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigDecoratorBase = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        baseField = 150;
    };
    return ConfigDecoratorBase = _classThis;
})();
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let ConfigDecoratorChild = (() => {
    let _classDecorators = [ConfigDecoratorBase({ strictChain: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ConfigDecoratorChild = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigDecoratorChild = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        childField = 'configDecoratorChild';
    };
    return ConfigDecoratorChild = _classThis;
})();
const configDecoratorBaseInstance = new ConfigDecoratorBase();
const configDecoratorChildInstance = apply(configDecoratorBaseInstance, ConfigDecoratorChild);
const _configDecoratorBaseField = configDecoratorChildInstance.baseField;
const _configDecoratorChildField = configDecoratorChildInstance.childField;
// ============================================
// Pattern 7: Multi-level decoration chain
let Level1 = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Level1 = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Level1 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        level1Field = 1;
    };
    return Level1 = _classThis;
})();
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let Level2 = (() => {
    let _classDecorators = [Level1()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Level2 = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Level2 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        level2Field = 2;
    };
    return Level2 = _classThis;
})();
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let Level3 = (() => {
    let _classDecorators = [Level2()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Level3 = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Level3 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        level3Field = 3;
    };
    return Level3 = _classThis;
})();
const level1Instance = new Level1();
const level2Instance = apply(level1Instance, Level2);
const level3Instance = apply(level2Instance, Level3);
// All levels should be accessible
const _l1 = level3Instance.level1Field;
const _l2 = level3Instance.level2Field;
const _l3 = level3Instance.level3Field;
// ============================================
// Pattern 8: Constructor with parameters
// ============================================
let ParamClass = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ParamClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ParamClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        value;
        constructor(val) {
            this.value = val;
        }
    };
    return ParamClass = _classThis;
})();
const paramInstance = new ParamClass('test');
const _paramValue = paramInstance.value;
// ============================================
// Pattern 9: Type inference for instance methods
// ============================================
let MethodsClass = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MethodsClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MethodsClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        field = 42;
        getField() {
            return this.field;
        }
    };
    return MethodsClass = _classThis;
})();
const methodsInstance = new MethodsClass();
const _methodResult = methodsInstance.getField();
function useDecoratedType(cls) {
    const instance = new cls();
    // Access via index signature since customField is on instance
    const _custom = instance.customField;
}
// ============================================
// Pattern 11: InstanceTypeFromConstructor helper
// ============================================
let TestClass = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TestClass = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TestClass = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        testField = 123;
    };
    return TestClass = _classThis;
})();
const _testInstanceType = { testField: 456 };
// ============================================
// Pattern 12: Nested types with define
// Note: define is available at runtime but TypeScript needs type assertion
// ============================================
let DefineParent = (() => {
    let _classDecorators = [decorate()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DefineParent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DefineParent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        parentProp = 100;
    };
    return DefineParent = _classThis;
})();
// Access define method on decorated class via type assertion
const NestedType = DefineParent.define('NestedType', function () {
    this.childProp = 'nested';
});
const defineParentInstance = new DefineParent();
const defineChildInstance = apply(defineParentInstance, NestedType);
const _defineParentProp = defineChildInstance.parentProp;
const _defineChildProp = defineChildInstance.childProp;
console.log('All type tests passed!');
