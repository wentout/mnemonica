# mnemonica

**Instance Inheritance System for JavaScript / TypeScript.**

> **Using this library?** You're in the right place. &nbsp;|&nbsp;
> **Contributing / modifying code?** Start with [`AGENTS.md`](./AGENTS.md).
> **Using mnemonica with tactica?** Read [`.ai/TACTICA.md`](./.ai/TACTICA.md) — mnemonica without tactica is 10% of the value.
> [`SKILL.md`](./SKILL.md) is a usage quick reference only (not for contributors).

Mnemonica builds typed prototype chains *between instances* (not just classes).
You declare a type with `define(name, ctor)`; new instances inherit through
the prototype chain from the instance they were created from. Mnemonica makes
the inheritance graph explicit — eliminating a class of `Object.setPrototypeOf`
and constructor-reuse bugs by design.

```
define(name, ctor)        →   TypeProxy   →   new instance.SubType()
                                  │                     │
                                  ▼                     ▼
                          subtype registry      InstanceCreator
                                  │                     │
                                  ▼                     ▼
                          preCreation hook       Mnemosyne
                                                       │
                                                       ▼
                                                instance with
                                                prototype chain →
                                                parent instance
                                                       │
                                                       ▼
                                                postCreation hook
```

Think `f(x) ⇒ y` where `this` is a persistent data structure carrying the
transformation history. Stored constructor arguments stay introspectable via
`getProps()`, so an instance is also a record of how it was built.

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)
[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)

> Status: experimental. API is stable for the documented surface; advanced
> internals (`_define`, `_lookup`, `defaultCollection`) are not part of the
> stability contract.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [TypeScript Support](#typescript-support)
- [API Reference](#api-reference)
  - [Core Functions](#core-functions)
  - [Type Reference](#type-reference)
  - [Type Management](#type-management)
  - [Instance Methods](#instance-methods)
  - [Utilities](#utilities)
  - [Hooks](#hooks)
  - [Error Handling](#error-handling)
  - [Symbols & Constants](#symbols--constants)
- [Configuration Options](#configuration-options)
- [Examples](#examples)
- [Usage with TypeØmatica](#usage-with-typeomatica)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

> AI agent integration guidance (introspection patterns, type discovery,
> safe construction) lives in [AGENTS.md](AGENTS.md). It is kept separate
> from the user-facing API reference.

---

## Overview

Mnemonica helps create ordered sequences of data transformations using prototype chain inheritance. It combines Object Instances with Inheritance through the Prototype Chain, enabling you to create new instances inherited from existing ones.

> *"O Great Mnemosyne! Please! Save us from Oblivion..."*
>
> — from the source, where memory persists

**Key Features:**
- Factory of Constructors with Prototype Chain Inheritance
- Instance-level inheritance (not just class-level)
- Async constructor support with chainable awaits
- Type-safe data flow definition
- Comprehensive hook system for lifecycle events

**Related Reading:**
- [Inheritance in JavaScript: Factory of Constructors with Prototype Chain](https://github.com/mythographica/stash/blob/master/inheritance.md)
- [Architecture of Prototype Inheritance in JavaScript](https://dev.to/wentout/architecture-of-prototype-inheritance-in-javascript-ce6)
- [Dead Simple type checker for JavaScript](https://dev.to/wentout/dead-simple-type-checker-for-javascript-4l40)

---

## Installation

```bash
npm install mnemonica
```

**Requirements:** Node.js `>=18 <26` (tested on 20.x, 22.x, 24.x in CI).

### From a Git checkout

```bash
git clone https://github.com/wentout/mnemonica.git
cd mnemonica
npm ci
npm run build      # compiles src/ → build/
npm run test:cov   # mocha + coverage
```

The ESM entry point (`mnemonica/module`) re-exports the CommonJS build, so
`npm run build` must succeed before `import 'mnemonica/module'` works from
a fresh checkout.

---

## Quick Start

### CommonJS

```js
const { define } = require('mnemonica');

// Define a type
const UserType = define('UserType', function (data) {
  Object.assign(this, data);
});

// Create an instance
const user = new UserType({ name: 'John', email: 'john@example.com' });

// Define a subtype
const AdminType = UserType.define('AdminType', function () {
  this.role = 'admin';
});

// Create nested instance (inherits from user)
const admin = new user.AdminType();
console.log(admin.name); // 'John' (inherited)
console.log(admin.role); // 'admin' (own property)
```

### ESM

```js
import { define, lookup } from 'mnemonica/module';
```

---

## Core Concepts

### Factory of Constructors

Define types using constructors, factory functions, or classes:

```js
// Using a constructor function
const SomeType = define('SomeType', function (opts) {
  Object.assign(this, opts);
});

// Using a factory function
const AnotherType = define(() => {
  const AnotherTypeConstructor = function (opts) {
    Object.assign(this, opts);
  };
  AnotherTypeConstructor.prototype.description = 'SomeType Constructor';
  return AnotherTypeConstructor;
});

// Using a class
const ClassType = define(() => {
  class MyClass {
    constructor(opts) {
      Object.assign(this, opts);
    }
  }
  return MyClass;
});
```

### Nested Type Definition

```js
// Define nested types
SomeType.define('SubType', function (opts) {
  this.other = opts.other;
}, {
  description: 'SomeSubType Constructor'
});

// Or using assignment
SomeType.SubType = function (opts) {
  this.other = opts.other;
};
SomeType.SubType.prototype = {
  description: 'SomeSubType Constructor'
};
```

### Instance Creation and Inheritance

```js
const someInstance = new SomeType({
  some: 'arguments',
  data: 'necessary'
});

const subInstance = new someInstance.SubType({
  other: 'data needed'
});

// All properties are inherited
console.log(subInstance.some);   // 'arguments' (inherited)
console.log(subInstance.other);  // 'data needed' (own)
```

### The `.extract()` Method

Extract all inherited properties into a flat object:

```js
const extracted = subInstance.extract();
// Result: { data, description, other, some }

// Or use the standalone utility
const { utils: { extract } } = require('mnemonica');
const extracted2 = extract(subInstance);
```

---

## TypeScript Support

The `define` function has full TypeScript support with comprehensive type definitions:

```typescript
import { define, apply, call, bind } from 'mnemonica';

interface UserData {
  email: string;
  password: string;
}

const UserType = define('UserType', function (this: UserData, data: UserData) {
  Object.assign(this, data);
});

// Nested constructors work with apply/call/bind for type inference
const user = new UserType({ email: 'test@test.com', password: 'secret' });
```

For complex nested types, use `apply`, `call`, or `bind` for better type inference:

```typescript
const SomeSubType = SomeType.define('SomeSubType', function (...args: string[]) {
  // ...
});

const someInstance = new SomeType();
const subInstance = call(someInstance, SomeSubType, 'arg1', 'arg2');
```

### Exported Type Definitions

The following types are available for advanced TypeScript usage:

```typescript
import {
  // Core constructor types
  IDEF,                          // Base constructor function type: { new(): T } | { (this: T, ...args): void }
  ConstructorFunction,           // Constructor with prototype
  Constructor,                   // Generic constructor type
  
  // Instance types
  MnemonicaInstance,             // Instance methods interface (extract, pick, parent, fork, etc.)
  Props,                         // Internal instance properties (__type__, __args__, __parent__, etc.)
  SiblingAccessor,               // Sibling type accessor type
  
  // Type definition types
  TypeClass,                     // Base type constructor returned by define()
  IDefinitorInstance,            // Definitor instance with define/lookup methods and subtypes
  DecoratedClass,                // Type for @decorate decorated classes
  TypeDef,                       // Type definition object structure
  
  // Configuration types
  constructorOptions,            // Type config options (strictChain, blockErrors, etc.)
  hooksTypes,                    // 'preCreation' | 'postCreation' | 'creationError'
  hook,                          // Hook callback type
  hooksOpts,                     // Hook options passed to callbacks
  CollectionDef,                 // Types collection definition
  
  // Utility function types
  ApplyFunction,                 // apply(entity, Ctor, args) => S
  CallFunction,                  // call(entity, Ctor, ...args) => S
  BindFunction,                  // bind(entity, Ctor) => (...args) => S
  
  // createTypesCollection types
  CreateTypesCollectionFunction, // (config?: constructorOptions) => TypesCollection
  TypesCollection,               // Interface returned by createTypesCollection
  
  // Configuration helper types
  HideInstanceMethodsOptions,    // constructorOptions & { exposeInstanceMethods: true }
  IsHidingMethods<Config>,       // Conditional type for exposeInstanceMethods: false detection
  
  // Utility types
  Proto<P, T>,                   // Merges parent P and child T types
  SN,                            // String-Name map for nested constructors
  SubtypesMap,                   // Map<string, TypeClass>
  TypeAbsorber,                  // Main define() function interface with overloads
} from 'mnemonica';
```

### Generic Type Patterns

Define types with proper generic constraints for full type safety:

```typescript
// Using IDEF with interface definitions
interface UserData {
  email: string;
  password: string;
}

// Type-safe constructor with 'this' context
const UserType = define('UserType', function (this: UserData, data: UserData) {
  Object.assign(this, data);
});

// Type-safe nested types with merged interfaces
interface AdminData {
  role: string;
}

const AdminType = UserType.define('AdminType', function (this: UserData & AdminData, role: string) {
  this.role = role;
  this.email; // string - inherited from UserData
});
```

### Async Constructor Type Patterns

```typescript
// Async type with proper return type
const AsyncType = define('AsyncType', async function (this: UserData, data: string) {
  await someAsyncOperation();
  return Object.assign(this, { data });
});

// With explicit awaitReturn option (no return required)
const AsyncTypeNoReturn = define('AsyncType', async function () {
  // No return needed
}, { awaitReturn: false });
```

---

## API Reference

### Core Functions

#### `define(typeName, constructHandler, config?)`

Defines a new type constructor. Returns a TypeClass.

```js
const MyType = define('MyType', function (data) {
  Object.assign(this, data);
}, {
  strictChain: true,
  blockErrors: true
});
```

**Parameters:**
- `typeName` (string): Name of the type (optional if using factory function)
- `constructHandler` (Function): Constructor function
- `config` (object, optional): Configuration options

#### `lookup(typeNestedPath)`

Looks up a type by its nested path.

```js
const { lookup } = require('mnemonica');
const SomeType = lookup('SomeType');
const SomeNestedType = lookup('SomeType.SomeNestedType');
```

#### `lookupTyped(typeNestedPath)`

Type-safe lookup function for use with tactica-generated type definitions. Requires TypeRegistry augmentation from tactica.

```typescript
import { lookupTyped } from 'mnemonica';

// Type-safe lookup - returns properly typed constructor
const UserType = lookupTyped('UserType');
const user = new UserType({ name: 'John' }); // Full type safety!

// Works with nested types too
const SubType = lookupTyped('Parent.SubType');
```

To enable type safety, generate types with tactica:

```bash
npx tactica
```

Then include the generated types in your project. See [Usage with @mnemonica/tactica](#usage-with-mnemonicatactica) for details.

#### `apply(entity, Constructor, args?)`

Applies a constructor to an entity with an array of arguments.

```js
const { apply } = require('mnemonica');
const subInstance = apply(parentInstance, SubType, ['arg1', 'arg2']);
```

#### `call(entity, Constructor, ...args)`

Calls a constructor on an entity with spread arguments.

```js
const { call } = require('mnemonica');
const subInstance = call(parentInstance, SubType, 'arg1', 'arg2');
```

#### `bind(entity, Constructor)`

Binds a constructor to an entity, returning a function.

```js
const { bind } = require('mnemonica');
const createSub = bind(parentInstance, SubType);
const subInstance = createSub('arg1', 'arg2');
```

#### `decorate(target?, config?)`

TypeScript decorator for class-based definitions.

**Usage Patterns:**

```typescript
import { decorate } from 'mnemonica';

// 1. Basic decoration
@decorate()
class MyClass {
  field: number = 123;
}

// 2. With configuration
@decorate({ strictChain: false, blockErrors: true })
class ConfiguredClass {
  field: number = 123;
}

// 3. Nested decoration (define as subtype)
@decorate()
class ParentClass {
  parentField: string = 'parent';
}

@decorate(ParentClass)
class ChildClass {
  childField: string = 'child';
}

// Create parent instance, then child from it
const parent = new ParentClass();
const child = new parent.ChildClass();

// 4. Parent with configuration
@decorate(ParentClass, { strictChain: false })
class ConfiguredChildClass {
  field: number = 123;
}

// 5. Using decorated class as decorator (advanced)
// After a class is decorated with @decorate(), it can be used
// as a decorator for nested types
@decorate()
class BaseDecorator {
  baseField: number = 100;
}

// Use BaseDecorator as a decorator
// @ts-ignore - TypeScript limitation with callable class types
@BaseDecorator()
class ExtendedClass {
  extField: number = 200;
}
```

**Note:** When using decorated classes as decorators (pattern 5), TypeScript may require `@ts-ignore` due to type checking limitations with callable class types.

#### `registerHook(Constructor, hookType, callback)`

Registers a hook for a specific constructor.

```js
const { registerHook } = require('mnemonica');

registerHook(MyType, 'preCreation', (hookData) => {
  console.log('Creating:', hookData.TypeName);
});
```

---

### Type Reference

For advanced TypeScript usage, the following types are exported from `mnemonica`:

| Type | Description | Usage |
|------|-------------|-------|
| `IDEF<T>` | Base constructor function type | `define('Name', fn: IDEF<MyType>)` |
| `MnemonicaInstance` | Instance methods interface | `instance.extract()`, `instance.pick()` |
| `TypeClass` | Base type constructor | `const MyType: TypeClass = define(...)` |
| `DecoratedClass<T>` | Decorated class type | `@decorate() class MyClass {}` |
| `IDefinitorInstance<N, S>` | Constructor with subtypes | Returned by `define()` with `.define()` method |
| `ConstructorFunction<T>` | Constructor with prototype | Generic constructor function signature |
| `constructorOptions` | Configuration options | `{ strictChain: true, blockErrors: true }` |
| `hooksTypes` | Hook type literals | `'preCreation' \| 'postCreation' \| 'creationError'` |
| `hook` | Hook callback type | `(opts: hooksOpts) => void` |
| `hooksOpts` | Hook options object | Passed to hook callbacks |
| `TypeDef` | Type definition structure | `instance.__type__` structure |
| `CollectionDef` | Types collection | `instance.__collection__` structure |
| `ApplyFunction` | apply() function type | `apply<E, T, S>(entity, Ctor, args) => S` |
| `CallFunction` | call() function type | `call<E, T, S>(entity, Ctor, ...args) => S` |
| `BindFunction` | bind() function type | `bind<E, T, S>(entity, Ctor) => (...args) => S` |

These types enable complete type safety when defining and using mnemonica types in TypeScript projects.

---

### Type Management

#### `defaultTypes`

The default types collection. All types defined with the top-level `define()` are stored here.

```js
const { defaultTypes } = require('mnemonica');
const MyType = defaultTypes.MyType;
```

#### `createTypesCollection(config?)`

Creates a new isolated types collection.

```js
const { createTypesCollection } = require('mnemonica');
const myCollection = createTypesCollection();
const MyType = myCollection.define('MyType', function () {});
```

**`TypesCollection` Interface:**

`createTypesCollection()` returns a `TypesCollection` object with the following interface:

```typescript
interface TypesCollection {
  // Define a new type in this collection
  define: TypeAbsorber;
  
  // Look up a type by its nested path (e.g., 'TypeName.SubType')
  lookup: (path: string) => TypeClass | undefined;
  
  // Register a hook for all types in this collection
  registerHook(hookType: hooksTypes, callback: hook): void;
  
  // Invoke hooks manually (advanced usage)
  invokeHook(hookType: hooksTypes, opts: hooksOpts): void;
  
  // Register a flow checker that runs before hooks
  registerFlowChecker(callback: () => unknown): void;
  
  // Map of all types defined in this collection
  subtypes: Map<string, TypeClass>;
  
  // Registered hooks for this collection
  hooks: Record<string, hook[]>;
}
```

**Example with full configuration:**

```js
const { createTypesCollection } = require('mnemonica');

// Create isolated collection with custom config
const myCollection = createTypesCollection({
  strictChain: false,
  blockErrors: false,
  exposeInstanceMethods: false  // Hide instance methods for cleaner API
});

// Define types in isolation
const MyType = myCollection.define('MyType', function (data) {
  Object.assign(this, data);
});

// Collection-level hooks
myCollection.registerHook('preCreation', (opts) => {
  console.log('Creating in myCollection:', opts.TypeName);
});

// Look up types within the collection
const FoundType = myCollection.lookup('MyType');
```

#### `getProps(instance)` / `setProps(instance, values)`

Get or set internal properties of an instance.

```js
const { getProps, setProps } = require('mnemonica');

const props = getProps(instance);
console.log(props.__type__, props.__args__);

// Set properties
setProps(instance, { __timestamp__: Date.now() });
```

---

### Instance Methods

All mnemonica instances have the following methods:

> **Note:** You can disable instance methods by setting `exposeInstanceMethods: false` in the type configuration. When disabled, these methods are still accessible via `getProps(instance).__self__` or the standalone `utils` export.

#### `.extract()`

Extracts all inherited properties into a single flat object.

```js
const extracted = instance.extract();
```

#### `.pick(...keys)` / `.pick([keys])`

Picks specific properties from the instance and its inheritance chain.

```js
const picked = instance.pick('email', 'password');
// or
const picked = instance.pick(['email', 'password']);
```

#### `.parent(constructorName?)`

Gets the parent instance. If `constructorName` is provided, walks up the chain.

```js
const immediateParent = instance.parent();
const specificParent = instance.parent('UserType');
```

#### `.clone`

Property that returns a cloned instance (same parent, same args).

```js
const cloned = instance.clone;
// Note: For async constructors, use: await instance.clone
```

#### `.fork(...args)`

Creates a forked instance from the same parent with optional new arguments.

```js
const forked = instance.fork();           // same args
const forkedWithNewArgs = instance.fork('new', 'args');
// Note: For async constructors, use: await instance.fork(...)
```

#### `.fork.call(thisArg, ...args)` / `.fork.apply(thisArg, args)`

Forks with a different `this` context (useful for Directed Acyclic Graphs).

```js
const dagInstance = instanceA.fork.call(instanceB, 'args');
```

#### `.exception(error, ...args)`

Creates an exception instance from the current instance.

```js
const error = someInstance.exception(new Error('Something went wrong'));
throw error;
```

#### `.sibling(typeName)` / `.sibling.TypeName`

Access sibling types from the same collection.

```js
const siblingType = instance.sibling('OtherType');
const sibling = instance.sibling.OtherType;
```

---

### Instance Properties (via `getProps`)

All instances have non-enumerable internal properties:

| Property | Type | Description |
|----------|------|-------------|
| `.__args__` | `unknown[]` | Arguments used for instance creation |
| `.__type__` | `TypeDef` | Type definition object |
| `.__parent__` | `object` | Parent instance reference |
| `.__subtypes__` | `Map<string, object>` | Map of available subtypes |
| `.__collection__` | `CollectionDef` | Types collection where type was defined |
| `.__stack__` | `string` | Stack trace (if `submitStack: true` in config) |
| `.__creator__` | `TypeDef` | Instance creator reference |
| `.__timestamp__` | `number` | Creation timestamp (ms since epoch) |
| `.__self__` | `object` | Self reference to the instance (useful when `exposeInstanceMethods: false`) |

---

### Utilities

Access via `utils` export:

```js
const { utils } = require('mnemonica');
```

#### `utils.extract(instance)`
Standalone extract function.

#### `utils.pick(instance, ...keys)`
Standalone pick function.

#### `utils.parent(instance, constructorName?)`
Standalone parent function.

#### `utils.parse(instance)`
Parses an instance structure, returning:
- `name`: constructor name
- `props`: extracted properties
- `self`: the instance itself
- `proto`: prototype object
- `joint`: prototype properties
- `parent`: parent prototype

```js
const { utils: { parse } } = require('mnemonica');
const parsed = parse(instance);
```

#### `utils.merge(A, B, ...args)`
Merges two instances using fork semantics.

```js
const merged = utils.merge(instanceA, instanceB, 'args');
// Note: For async constructors, use: await utils.merge(...)
```

#### `utils.toJSON(instance)`
Serializes an instance to JSON.

```js
const json = utils.toJSON(instance);
```

#### `utils.collectConstructors(instance, flat?)`
Collects all constructors in the instance's prototype chain.

```js
const constructors = utils.collectConstructors(instance, true);
```

---

### Hooks

#### Hook Types

- `'preCreation'` - Called before instance creation
- `'postCreation'` - Called after instance creation
- `'creationError'` - Called when instance creation throws an error

#### `type.registerHook(hookType, callback)`

Register a hook on a specific type.

```js
MyType.registerHook('preCreation', (hookData) => {
  console.log('Creating:', hookData.TypeName);
});
```

#### `collection.registerHook(hookType, callback)`

Register a hook on a types collection.

```js
defaultTypes.registerHook('postCreation', (hookData) => {
  console.log('Created:', hookData.inheritedInstance.constructor.name);
});
```

#### `collection.registerFlowChecker(callback)`

Register a flow checker that runs before hooks.

```js
defaultTypes.registerFlowChecker((opts) => {
  console.log('Flow check:', opts.TypeName);
});
```

#### Hook Data Structure

```typescript
interface HookData {
  TypeName: string;              // Constructor name
  type: TypeDef;                 // The type being constructed
  args: unknown[];               // Arguments passed to constructor
  existentInstance: object;      // Parent instance
  inheritedInstance: object;     // New instance (postCreation only)
  throwModificationError(error: Error): void;  // Throw error from hook
}
```

```js
MyType.registerHook('postCreation', (hookData) => {
  // Throw custom error from hook
  hookData.throwModificationError(new Error('Custom hook error'));
});
```

**Note:** In preCreation hooks, `existentInstance` refers to the parent; in postCreation hooks, it refers to the instance used for inheritance.

---

### Error Handling

#### Error Types

All mnemonica errors extend `BASE_MNEMONICA_ERROR`:

```js
const { errors } = require('mnemonica');

// Available error types:
errors.BASE_MNEMONICA_ERROR
errors.WRONG_TYPE_DEFINITION
errors.WRONG_INSTANCE_INVOCATION
errors.WRONG_MODIFICATION_PATTERN
errors.ALREADY_DECLARED
errors.TYPENAME_MUST_BE_A_STRING
errors.HANDLER_MUST_BE_A_FUNCTION
errors.WRONG_ARGUMENTS_USED
errors.WRONG_HOOK_TYPE
errors.MISSING_HOOK_CALLBACK
errors.MISSING_CALLBACK_ARGUMENT
errors.FLOW_CHECKER_REDEFINITION
errors.OPTIONS_ERROR
errors.WRONG_STACK_CLEANER
```

#### Exception Instances

When creating exceptions using `instance.exception()`:

```js
const error = instance.exception(new Error('Original error'));

// Properties:
error.originalError    // The original error
error.exceptionReason  // { methodName, ... }
error.BaseStack        // Base stack trace
error.parse()          // Parse the exception structure
error.extract()        // Extract properties from the exception
```

#### Stack Cleaning

```js
const { defineStackCleaner } = require('mnemonica');

// Add regex patterns to clean stack traces
defineStackCleaner(/node_modules\/some-package/);
```

---

### Symbols & Constants

```js
const {
  SymbolParentType,              // Parent type symbol
  SymbolConstructorName,         // Constructor name symbol
  SymbolDefaultTypesCollection,  // Default collection symbol
  SymbolConfig,                  // Config symbol
  MNEMONICA,                     // Library name
  MNEMOSYNE                      // Collection identifier
} = require('mnemonica');
```

---

## Configuration Options

Pass options as the third argument to `define()`:

```js
define('SomeType', function () {}, {
  strictChain: true,        // Only allow sub-instances from current type
  blockErrors: true,        // Disallow construction if error in prototype chain
  submitStack: false,       // Collect stack trace as __stack__ property
  awaitReturn: true,        // Ensure await new Constructor() returns value
  ModificationConstructor: fn,  // Custom modification constructor
  asClass: false,           // Force class mode (auto-detected by default)
  exposeInstanceMethods: true   // Expose instance methods (default: true for backward compatibility)
});
```

### Configuration Option Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strictChain` | `boolean` | `true` | If `true`, only direct subtypes can be instantiated. If `false`, allows using subtypes from parent chains. |
| `blockErrors` | `boolean` | `true` | If `true`, prevents construction when errors exist in the prototype chain. |
| `submitStack` | `boolean` | `false` | If `true`, collects stack trace and stores as `__stack__` property on instances. |
| `awaitReturn` | `boolean` | `true` | For async constructors, ensures `await new Constructor()` returns the instance. |
| `asClass` | `boolean` | `auto` | Force class mode detection. Usually auto-detected from constructor syntax. |
| `exposeInstanceMethods` | `boolean` | `true` | Expose instance methods on the instance. Set to `false` to hide from TypeScript types. See details below. |
| `ModificationConstructor` | `Function` | - | Custom constructor function for internal instance modification. |

### `exposeInstanceMethods` Option

Controls whether instance methods (`extract()`, `pick()`, `parent()`, `clone`, `fork()`, `exception()`, `sibling()`) are exposed on the instance type.

| Value | Behavior |
|-------|----------|
| `true` (default) | All instance methods are available directly on instances |
| `false` | Methods are hidden from TypeScript types but still accessible via prototype chain |

**Use Case:** Set to `false` when you want a cleaner public API and don't want internal mnemonica methods cluttering autocomplete/IntelliSense.

```typescript
import { define, getProps, utils } from 'mnemonica';

// With exposeInstanceMethods: false
const CleanType = define('CleanType', function (data) {
  Object.assign(this, data);
}, { exposeInstanceMethods: false });

const instance = new CleanType({ value: 42 });

// Methods not available directly on instance (TypeScript error)
// instance.extract();  // Error!

// But still accessible via getProps
const props = getProps(instance);
props.__self__.extract();  // Works!

// Or using utils
utils.extract(instance);  // Works!
```

### Override Default Config for Collection

```js
import { defaultTypes, SymbolConfig } from 'mnemonica';

defaultTypes[SymbolConfig].blockErrors = false;
```

---

## Usage with TypeØmatica

TypeØmatica is a companion library that provides strict runtime type checking using JavaScript Proxies. It enforces types at runtime exactly as TypeScript expects at compile time.

```typescript
import { BaseClass } from 'typeomatica';
import { decorate } from 'mnemonica';

@decorate()
class User extends BaseClass {
  name: string = 'default';
  age: number = 0;
}

const user = new User();
user.name = 'John';     // ✓ Works - string to string
user.age = 25;          // ✓ Works - number to number

// @ts-ignore
user.age = '25';        // ✗ TypeError: Type Mismatch at runtime!
```

For complete documentation including integration patterns, error handling, and advanced usage, see [docs/typeomatica.md](docs/typeomatica.md).

---

> **AI agent guidance.** Patterns for type introspection, safe property
> access, type discovery, instance traversal, and safe construction live
> in [AGENTS.md](AGENTS.md). They are not duplicated here.

---

## Examples

Runnable scripts in [`examples/`](examples/) demonstrate edge cases and
integration patterns. See [examples/README.md](examples/README.md). Quick
runners are wired up in `package.json`:

```bash
npm run example:async    # async constructor edge case
npm run example:rename   # constructor renaming via Object.defineProperty
npm run example:v8bug    # documents a Node 22 .stack/.hasOwn divergence
```

### Working with Collections

```js
const { createTypesCollection, defaultTypes } = require('mnemonica');

// Create isolated collection for testing
const testCollection = createTypesCollection({
  strictChain: false,
  blockErrors: false
});

// Define types in isolation
const TestType = testCollection.define('TestType', function () {});

// Register collection-level hooks
testCollection.registerHook('preCreation', (data) => {
  console.log('Creating in test collection:', data.TypeName);
});
```

### Asynchronous Constructors

```js
const AsyncType = define('AsyncType', async function (data) {
  await someAsyncOperation();
  return Object.assign(this, { data });
});

// Usage
const asyncInstance = await new AsyncType('tada');

// Nested async types
const NestedAsync = AsyncType.define('NestedAsync', async function (data) {
  return Object.assign(this, { nestedData: data });
});

const nested = await new asyncInstance.NestedAsync('nested');
```

### Async Chain with Single Await

```js
async (req, res) => {
  const result = await new UserTypeConstructor({
      email: req.body.email,
      password: req.body.password
    })
    .UserEntityValidate('valid sign')
    .WithoutPassword()
    .AsyncPushToStorage()
    .AsyncGetStorageResponse()
    .SyncValidateStorageData()
    .AsyncReplyToRequest(res);
};
```

### Using `call` with Existing Objects

```js
// Combine with process, window, document, etc.
const usingProcessAsProto = Singletoned.call(process, {
  some: 'arguments'
});

// With React
import ReactDOM from "react-dom";
const ReactDOOMed = define("ReactDOOMed", function() {});
const usingReactAsProto = ReactDOOMed.call(ReactDOM);
```

### Directed Acyclic Graphs (DAG)

```js
// Fork from different parent
const dagInstance = instanceA.fork.call(instanceB, 'args');

// Or use merge utility
const { utils: { merge } } = require('mnemonica');
const merged = merge(instanceA, instanceB, 'args');
```

---

## Roadmap

Items below are designed but **not yet shipped**. They are documented here
so consumers can avoid relying on them prematurely.

### Nested `lookupTyped()`

**Problem.** Global `lookupTyped('Parent.Child')` returns a constructor
*without* the parent in the prototype chain — that breaks instance
inheritance.

**Planned.** A type-safe `.lookupTyped()` method on constructors for
relative lookups that preserve the chain:

```typescript
const GraphNode2D = Scene2D.lookupTyped('GraphNode2D');
const node = new GraphNode2D({ x: 10, y: 20 });
// node has Scene2D in its prototype chain
```

This requires a `NestedTypeRegistry` interface augmentation alongside
`TypeRegistry` and is generated by [tactica](https://www.npmjs.com/package/typeomatica).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch model, commit style, and
the local build/test loop. Repository conventions, code style, and agent
rules live in [AGENTS.md](AGENTS.md). Release notes live in
[CHANGELOG.md](CHANGELOG.md).

**Related reading:**
- [Inheritance in JavaScript: Factory of Constructors with Prototype Chain](https://github.com/mythographica/stash/blob/master/inheritance.md)
- [Architecture of Prototype Inheritance in JavaScript](https://dev.to/wentout/architecture-of-prototype-inheritance-in-javascript-ce6)
- [Dead Simple type checker for JavaScript](https://dev.to/wentout/dead-simple-type-checker-for-javascript-4l40)

---

## License

MIT — Copyright (c) 2019 https://github.com/wentout

---

> *"O Great Mnemosyne! Please! Save us from Oblivion..."*
>
> — from the source, where memory persists
