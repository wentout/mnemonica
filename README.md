# mnemonica

**Abstract technique that aids information retention: Instance Inheritance System**

... allows us to make inherited descriptions of mappings of transformations from predecessor structured data types to the successors, as if it was math `f(x)=>y` ... and we will use `this` keyword as a persistent data structure where we will apply that transformations

![concept](https://raw.githubusercontent.com/mythographica/stash/master/img/LifeCycle/LifeCycle.png)


---

# shortcuts

* ?. : state : **mad science**
* ?. : type : **asynchronous monad descriptor** => this
* ?. : prod ready : **we wonder about**
* ?. : example : **git clone && npm run example**

---
[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)
[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [TypeScript Support](#typescript-support)
- [API Reference](#api-reference)
  - [Core Functions](#core-functions)
  - [Type Management](#type-management)
  - [Instance Methods](#instance-methods)
  - [Utilities](#utilities)
  - [Hooks](#hooks)
  - [Error Handling](#error-handling)
  - [Symbols & Constants](#symbols--constants)
- [Configuration Options](#configuration-options)
- [AI Agent Usage Guide](#ai-agent-usage-guide)
- [Examples](#examples)

---

## Overview

Mnemonica helps create ordered sequences of data transformations using prototype chain inheritance. It combines Object Instances with Inheritance through the Prototype Chain, enabling you to create new instances inherited from existing ones.

Think of it as a mathematical function `f(x) => y` where `this` is your persistent data structure and transformations are applied sequentially.

> *"O Great Mnemosyne! Please! Save us from Oblivion..."*
> — from the source, where memory persists

![concept](https://raw.githubusercontent.com/mythographica/stash/master/img/LifeCycle/LifeCycle.png)

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

**Requirements:** Node.js >=16 <24

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

The `define` function has full TypeScript support:

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

```typescript
import { decorate } from 'mnemonica';

@decorate()
class MyClass {
  field: number = 123;
}

// With configuration
@decorate({ strictChain: false })
class ConfiguredClass {
  // ...
}

// Nested decoration
@decorate()
class ParentClass {}

@decorate(ParentClass)
class ChildClass {}
```

#### `registerHook(Constructor, hookType, callback)`

Registers a hook for a specific constructor.

```js
const { registerHook } = require('mnemonica');

registerHook(MyType, 'preCreation', (hookData) => {
  console.log('Creating:', hookData.TypeName);
});
```

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

| Property | Description |
|----------|-------------|
| `.__args__` | Arguments used for instance creation |
| `.__type__` | Type definition object |
| `.__parent__` | Parent instance reference |
| `.__subtypes__` | Map of available subtypes |
| `.__collection__` | Types collection where type was defined |
| `.__stack__` | Stack trace (if `submitStack: true` in config) |
| `.__creator__` | Instance creator reference |
| `.__timestamp__` | Creation timestamp (ms since epoch) |
| `.__self__` | Self reference to the instance |

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

```js
{
  TypeName: string,              // Constructor name
  type: TypeDescriptor,          // The type being constructed
  args: unknown[],               // Arguments passed to constructor
  existentInstance: object,      // Parent instance
  inheritedInstance: object      // New instance (postCreation only)
}
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
  strictChain: true,       // Only allow sub-instances from current type
  blockErrors: true,       // Disallow construction if error in prototype chain
  submitStack: false,      // Collect stack trace as __stack__ property
  awaitReturn: true,       // Ensure await new Constructor() returns value
  ModificationConstructor: fn,  // Custom modification constructor
  asClass: false           // Force class mode (auto-detected by default)
});
```

### Override Default Config for Collection

```js
import { defaultTypes, SymbolConfig } from 'mnemonica';

defaultTypes[SymbolConfig].blockErrors = false;
```

---

## AI Agent Usage Guide

This section helps AI agents understand and work with mnemonica programmatically.

### 1. Type Introspection

Use `utils.parse(instance)` to understand instance structure:

```js
const { utils: { parse } } = require('mnemonica');

const parsed = parse(instance);
// Returns: { name, props, self, proto, joint, parent, constructor }
```

### 2. Safe Property Access

Always use `getProps()` instead of direct property access:

```js
const { getProps } = require('mnemonica');

const props = getProps(instance);
// props.__type__, props.__args__, props.__parent__, props.__subtypes__, etc.
```

### 3. Type Discovery

```js
const { defaultTypes } = require('mnemonica');

// List all types in default collection
const typeNames = [...defaultTypes.subtypes.keys()];

// List subtypes of a specific type
const myType = defaultTypes.MyType;
const subTypeNames = [...myType.subtypes.keys()];

// Check if a type exists
const hasType = defaultTypes.lookup('MyType') !== undefined;
```

### 4. Instance Traversal

```js
const { getProps } = require('mnemonica');

// Walk up the inheritance chain
function traverseChain(instance) {
  const chain = [];
  let current = instance;
  
  while (current) {
    const props = getProps(current);
    if (!props) break;
    
    chain.push({
      typeName: props.__type__.TypeName,
      timestamp: props.__timestamp__,
      args: props.__args__
    });
    
    current = props.__parent__;
  }
  
  return chain;
}
```

### 5. Safe Construction Patterns

```js
const { lookup } = require('mnemonica');

// Always check if type exists before construction
const MyType = lookup('MyType');
if (MyType) {
  const instance = new MyType(data);
}

// For nested construction with proper error handling
try {
  const subInstance = new instance.SubType(data);
} catch (error) {
  // Handle WRONG_MODIFICATION_PATTERN if SubType not defined
  console.error('Subtype not available:', error.message);
}
```

### 6. Analyzing Type Structure

```js
const { getProps } = require('mnemonica');

function analyzeType(typeConstructor) {
  return {
    name: typeConstructor.TypeName,
    isSubType: typeConstructor.isSubType,
    subTypesCount: typeConstructor.subtypes?.size || 0,
    hasHooks: Object.keys(typeConstructor.hooks || {}).length > 0,
    config: typeConstructor.config
  };
}
```

### 7. Working with Collections

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

---

## Examples

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

## Epilogue

So, now you can craft as many types as you wish, combine them, re-define them and spend much more time playing with them:

* test : instances & arguments
* track : moments of creation
* check : if the order of creation is OK
* validate : everything, 4 example use sort of TS in runtime
* and even `.parse` them using `mnemonica.utils.parse`

Good Luck!

---

## License

MIT

Copyright (c) 2019 https://github.com/wentout
