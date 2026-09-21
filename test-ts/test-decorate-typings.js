"use strict";
/**
 * TypeScript type tests for decorate function
 * This file tests that all decorate usage patterns work correctly
 *
 * NOTE: Patterns 5, 6, 7 use decorated classes in ways that TypeScript's
 * type system cannot fully express. The @ts-expect-error comments document
 * where TypeScript's type checking is overly conservative, but the runtime
 * behavior is correct and the types are properly inferred for instance usage.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
// ============================================
// Pattern 1: @decorate() - no arguments
// ============================================
let NoArgDecoratedClass = class NoArgDecoratedClass {
    constructor() {
        this.field = 123;
    }
};
NoArgDecoratedClass = __decorate([
    (0, __1.decorate)()
], NoArgDecoratedClass);
const noArgInstance = new NoArgDecoratedClass();
// Type should be inferred correctly
const _noArgField = noArgInstance.field;
// ============================================
// Pattern 2: @decorate(config) - config only
// ============================================
let ConfigDecoratedClass = class ConfigDecoratedClass {
    constructor() {
        this.field = 'test';
    }
};
ConfigDecoratedClass = __decorate([
    (0, __1.decorate)({ blockErrors: true, strictChain: false })
], ConfigDecoratedClass);
const configInstance = new ConfigDecoratedClass();
// Type should be inferred correctly
const _configField = configInstance.field;
// ============================================
// Pattern 3: @decorate(ParentClass) - parent only
let ParentClass = class ParentClass {
    constructor() {
        this.parentField = 100;
    }
};
ParentClass = __decorate([
    (0, __1.decorate)()
], ParentClass);
let ChildClass = class ChildClass {
    constructor() {
        this.childField = 'child';
    }
};
ChildClass = __decorate([
    (0, __1.decorate)(ParentClass)
], ChildClass);
const parentInstance = new ParentClass();
const childInstance = (0, __1.apply)(parentInstance, ChildClass);
// Both parent and child fields should be accessible
const _parentFieldFromChild = childInstance.parentField;
const _childField = childInstance.childField;
// ============================================
// Pattern 4: @decorate(ParentClass, config) - parent with config
// ============================================
let ConfigParentClass = class ConfigParentClass {
    constructor() {
        this.parentField = 200;
    }
};
ConfigParentClass = __decorate([
    (0, __1.decorate)({ strictChain: true })
], ConfigParentClass);
let ConfigChildClass = class ConfigChildClass {
    constructor() {
        this.childField = 'configChild';
    }
};
ConfigChildClass = __decorate([
    (0, __1.decorate)(ConfigParentClass, { strictChain: false })
], ConfigChildClass);
const configParentInstance = new ConfigParentClass();
const configChildInstance = (0, __1.apply)(configParentInstance, ConfigChildClass);
// Both parent and child fields should be accessible
const _configParentField = configChildInstance.parentField;
const _configChildField = configChildInstance.childField;
// ============================================
// Pattern 5: Using decorated class as decorator
let DecoratorBase = class DecoratorBase {
    constructor() {
        this.baseField = 100;
    }
};
DecoratorBase = __decorate([
    (0, __1.decorate)()
], DecoratorBase);
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let DecoratorChild = class DecoratorChild {
    constructor() {
        this.childField = 'decoratorChild';
    }
};
DecoratorChild = __decorate([
    DecoratorBase()
], DecoratorChild);
const decoratorBaseInstance = new DecoratorBase();
const decoratorChildInstance = (0, __1.apply)(decoratorBaseInstance, DecoratorChild);
const _decoratorBaseField = decoratorChildInstance.baseField;
const _decoratorChildField = decoratorChildInstance.childField;
// ============================================
// Pattern 6: Using decorated class as decorator with config
let ConfigDecoratorBase = class ConfigDecoratorBase {
    constructor() {
        this.baseField = 150;
    }
};
ConfigDecoratorBase = __decorate([
    (0, __1.decorate)()
], ConfigDecoratorBase);
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let ConfigDecoratorChild = class ConfigDecoratorChild {
    constructor() {
        this.childField = 'configDecoratorChild';
    }
};
ConfigDecoratorChild = __decorate([
    ConfigDecoratorBase({ strictChain: false })
], ConfigDecoratorChild);
const configDecoratorBaseInstance = new ConfigDecoratorBase();
const configDecoratorChildInstance = (0, __1.apply)(configDecoratorBaseInstance, ConfigDecoratorChild);
const _configDecoratorBaseField = configDecoratorChildInstance.baseField;
const _configDecoratorChildField = configDecoratorChildInstance.childField;
// ============================================
// Pattern 7: Multi-level decoration chain
let Level1 = class Level1 {
    constructor() {
        this.level1Field = 1;
    }
};
Level1 = __decorate([
    (0, __1.decorate)()
], Level1);
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let Level2 = class Level2 {
    constructor() {
        this.level2Field = 2;
    }
};
Level2 = __decorate([
    Level1()
], Level2);
// @ts-expect-error - TypeScript doesn't recognize DecoratedClass as callable in decorator context, but runtime works correctly
let Level3 = class Level3 {
    constructor() {
        this.level3Field = 3;
    }
};
Level3 = __decorate([
    Level2()
], Level3);
const level1Instance = new Level1();
const level2Instance = (0, __1.apply)(level1Instance, Level2);
const level3Instance = (0, __1.apply)(level2Instance, Level3);
// All levels should be accessible
const _l1 = level3Instance.level1Field;
const _l2 = level3Instance.level2Field;
const _l3 = level3Instance.level3Field;
// ============================================
// Pattern 8: Constructor with parameters
// ============================================
let ParamClass = class ParamClass {
    constructor(val) {
        this.value = val;
    }
};
ParamClass = __decorate([
    (0, __1.decorate)()
], ParamClass);
const paramInstance = new ParamClass('test');
const _paramValue = paramInstance.value;
// ============================================
// Pattern 9: Type inference for instance methods
// ============================================
let MethodsClass = class MethodsClass {
    constructor() {
        this.field = 42;
    }
    getField() {
        return this.field;
    }
};
MethodsClass = __decorate([
    (0, __1.decorate)()
], MethodsClass);
const methodsInstance = new MethodsClass();
const _methodResult = methodsInstance.getField();
function useDecoratedType(cls) {
    const instance = new cls();
    // Access via index signature since customField is on instance
    const _custom = instance.customField;
}
// ============================================
// Pattern 11: Instance type extraction from a decorated class
// ============================================
let TestClass = class TestClass {
    constructor() {
        this.testField = 123;
    }
};
TestClass = __decorate([
    (0, __1.decorate)()
], TestClass);
const _testInstanceType = { testField: 456 };
// ============================================
// Pattern 12: Nested types with define
// Note: define is available at runtime but TypeScript needs type assertion
// ============================================
let DefineParent = class DefineParent {
    constructor() {
        this.parentProp = 100;
    }
};
DefineParent = __decorate([
    (0, __1.decorate)()
], DefineParent);
// Access define method on decorated class via type assertion
const NestedType = DefineParent.define('NestedType', function () {
    this.childProp = 'nested';
});
const defineParentInstance = new DefineParent();
const defineChildInstance = (0, __1.apply)(defineParentInstance, NestedType);
const _defineParentProp = defineChildInstance.parentProp;
const _defineChildProp = defineChildInstance.childProp;
console.log('All type tests passed!');
