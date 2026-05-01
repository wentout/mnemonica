# TypeØmatica Integration Guide

**Strict Runtime Type Checking for Mnemonica**

TypeØmatica is a companion library that provides strict runtime type checking for JavaScript objects using Proxy-based interception. It enforces type safety at runtime exactly as TypeScript expects at compile time.

---

## Table of Contents

- [What is TypeØmatica?](#what-is-typeomatica)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Integration Patterns](#integration-patterns)
- [Type Examples](#type-examples)
- [Working with Wrapped Values](#working-with-wrapped-values)
- [Error Handling](#error-handling)
- [Advanced: Custom Fields](#advanced-custom-fields)
- [Complete Integration Example](#complete-integration-example)
- [Error Reference](#error-reference)

---

## What is TypeØmatica?

TypeØmatica is part of the mnemonica project ecosystem. It uses JavaScript Proxies to intercept property access and assignment, remembering the initial type of each property and enforcing that type for all subsequent operations.

**Key Features:**
- Runtime type enforcement (complements TypeScript's compile-time checks)
- Proxy-based property interception
- Locked types after initial assignment
- Prevents type mutations at runtime

```typescript
import { BaseClass } from 'typeomatica';

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

---

## Installation

```bash
npm install typeomatica
```

---

## Core Concepts

### Proxy-Based Architecture

TypeØmatica uses JavaScript's Proxy API with custom handlers for:
- `get` - Intercepts property reads
- `set` - Intercepts property writes (validates types)
- `setPrototypeOf` - Blocks prototype mutation
- `defineProperty` - Blocks property redefinition
- `deleteProperty` - Blocks property deletion

### Type Resolution

When a property is first assigned, TypeØmatica determines its type category:

| Category | Types | Behavior |
|----------|-------|----------|
| `primitives` | string, number, boolean, bigint, symbol, undefined | Wrapped in type-safe accessors |
| `nullish` | null | Only null assignments allowed |
| `objects` | object, arrays, dates | Must be same object type |
| `functions` | methods | Restricted on data types |

### Decorator Application Order

When combining `@decorate()` (mnemonica) with `@Strict()` (typeomatica), order matters:

```typescript
@decorate({ blockErrors: true })  // OUTER - executes second
@Strict()                          // INNER - executes first
class MyClass { }
```

Decorators apply **bottom-to-top** (inner to outer). `@Strict` wraps the class first, then `@decorate` adds mnemonica's inheritance system on top.

---

## API Reference

### BaseClass

The primary class for creating strict-type objects.

```typescript
import { BaseClass } from 'typeomatica';

class MyClass extends BaseClass {
  field: string = 'value';
  constructor() {
    super();
  }
}
```

### BasePrototype / BaseConstructorPrototype

Functional equivalent of `BaseClass`.

```typescript
import { BasePrototype } from 'typeomatica';

const Base = BasePrototype({ initialProp: 123 });
class MyClass extends Base { }
```

### @Strict() Decorator

Apply strict typing to any class without extending BaseClass.

```typescript
import { Strict } from 'typeomatica';

@Strict({ deep: true })
class MyClass {
  field: number = 0;
}
```

**Options:**
- `deep: true` - Enables recursive/deep property checking
- Pass initial values as properties to pre-define types

### SymbolTypeomaticaProxyReference

Access the internal proxy reference.

```typescript
import { SymbolTypeomaticaProxyReference } from 'typeomatica';

const proxyRef = instance[SymbolTypeomaticaProxyReference];
```

### SymbolInitialValue

Access the original initial value of a property.

```typescript
import { SymbolInitialValue } from 'typeomatica';

const originalValue = instance[SymbolInitialValue]('fieldName');
```

---

## Integration Patterns

### Pattern 1: BaseClass as Prototype

Inject type checking into existing class hierarchies.

```typescript
import { BaseClass } from 'typeomatica';

class UserData {
  name: string = 'default';
  age: number = 0;
}

// Inject typeomatica proxy into prototype chain
Object.setPrototypeOf(UserData.prototype, new BaseClass({ deep: true }));

const user = new UserData();
user.name = 'John';     // ✓ Works
// @ts-ignore
user.name = 123;        // ✗ TypeError: Type Mismatch
```

### Pattern 2: @Strict Decorator

Use decorator for classes without inheritance constraints.

```typescript
import { Strict } from 'typeomatica';

@Strict({ deep: true })
class Product {
  id: number = 0;
  title: string = '';
  price: number = 0.00;
  inStock: boolean = false;
}

const product = new Product();
product.price = 29.99;      // ✓ Works
// @ts-ignore
product.price = '$29.99';   // ✗ TypeError: Type Mismatch
```

### Pattern 3: Combined @decorate + @Strict

Use both mnemonica and typeomatica together.

```typescript
import { decorate, apply } from 'mnemonica';
import { Strict } from 'typeomatica';

@decorate({ blockErrors: true })  // OUTER
@Strict()                          // INNER
class Order {
  orderId: string = '';
  items: string[] = [];
  total: number = 0;
}

const order = new Order();
// @ts-ignore
order.total = '100';  // ✗ TypeError: Type Mismatch
```

**Important:** `@Strict()` must come AFTER `@decorate()` (bottom position).

### Pattern 4: Extending BaseClass with @decorate

Direct inheritance from typeomatica's base with mnemonica decoration.

```typescript
import { BaseClass } from 'typeomatica';
import { decorate } from 'mnemonica';

@decorate()
class Customer extends BaseClass {
  customerId: number = 0;
  email: string = '';
  
  constructor() {
    super();
  }
}

// Works with .define() for subtypes
const PremiumCustomer = Customer.define('PremiumCustomer', function(this: { tier: string }) {
  this.tier = 'gold';
});

const premium = new PremiumCustomer();
// @ts-ignore
premium.tier = 123;  // ✗ TypeError: Type Mismatch
```

---

## Type Examples

### Primitives

All primitive types are fully supported and enforced.

```typescript
class Primitives extends BaseClass {
  str: string = 'hello';
  num: number = 42;
  bool: boolean = true;
  bigint: bigint = BigInt(100);
  sym: symbol = Symbol('test');
}

const p = new Primitives();

// Valid assignments
p.str = 'world';          // ✓ string → string
p.num = 100;              // ✓ number → number
p.bool = false;           // ✓ boolean → boolean
p.bigint = BigInt(200);   // ✓ bigint → bigint

// Invalid assignments throw TypeError
// @ts-ignore
p.str = 123;              // ✗ TypeError: Type Mismatch
// @ts-ignore
p.num = '100';            // ✗ TypeError: Type Mismatch
// @ts-ignore
p.bool = 'true';          // ✗ TypeError: Type Mismatch
// @ts-ignore
p.bigint = 100;           // ✗ TypeError: Type Mismatch
```

### Null and Undefined

Null and undefined are distinct types.

```typescript
class Nullable extends BaseClass {
  nullValue: null = null;
  undefinedValue: undefined = undefined;
}

const n = new Nullable();

n.nullValue = null;              // ✓
n.undefinedValue = undefined;    // ✓

// @ts-ignore
n.nullValue = undefined;         // ✗ TypeError: Type Mismatch
// @ts-ignore
n.nullValue = 0;                 // ✗ TypeError: Type Mismatch
// @ts-ignore
n.undefinedValue = null;         // ✗ TypeError: Type Mismatch
```

### Objects

Object types are strictly enforced by constructor.

```typescript
class WithObject extends BaseClass {
  data: object = {};
  list: number[] = [];
  map: Map<string, number> = new Map();
}

const w = new WithObject();

w.data = { a: 1 };              // ✓ Same type (object)
w.data = { b: 2 };              // ✓ Same type (object)
w.list = [1, 2, 3];             // ✓ Array → Array
w.map = new Map();              // ✓ Map → Map

// @ts-ignore
w.data = 123;                   // ✗ TypeError: Type Mismatch
// @ts-ignore
w.data = new Set();             // ✗ TypeError: Type Mismatch (Set !== Object)
// @ts-ignore
w.list = new Set();             // ✗ TypeError: Type Mismatch (Set !== Array)
```

---

## Working with Wrapped Values

TypeØmatica wraps primitive values to enforce type safety. Use `valueOf()` to access the raw value for operations.

### Numeric Operations

```typescript
class Calculations extends BaseClass {
  count: number = 10;
}

const calc = new Calculations();

// ✗ Direct arithmetic throws
try {
  const result = calc.count + 5;
} catch (e) {
  // ReferenceError: Value Access Denied
}

// ✓ Use valueOf() for operations
const result = calc.count.valueOf() + 5;  // 15

// ✓ Use unary + for coercion
const sum = 3 + +calc.count;  // 13

// ✓ Comparison works with valueOf()
if (calc.count.valueOf() > 5) {
  // ...
}
```

### String Operations

```typescript
class TextData extends BaseClass {
  message: string = 'hello';
}

const text = new TextData();

// Access string methods through valueOf()
text.message.valueOf().toUpperCase();  // 'HELLO'
text.message.valueOf().length;         // 5
text.message.valueOf().substring(0, 2); // 'he'

// Template literals require valueOf()
const greeting = `Message: ${text.message.valueOf()}`;
```

### Boolean Operations

```typescript
class Flags extends BaseClass {
  active: boolean = true;
}

const flags = new Flags();

// ✗ Direct comparison throws
try {
  if (flags.active) { }  // May throw in some contexts
} catch (e) {
  // ReferenceError: Value Access Denied
}

// ✓ Use valueOf() for conditions
if (flags.active.valueOf()) {
  // ...
}

// ✓ Comparison with valueOf()
const isActive = flags.active.valueOf() === true;
```

---

## Error Handling

TypeØmatica throws specific error types for different violations.

```typescript
import { BaseClass } from 'typeomatica';

class SecureData extends BaseClass {
  id: number = 1;
  name: string = 'test';
  data: object = {};
}

const secure = new SecureData();

// Type Mismatch - wrong type assignment
try {
  // @ts-ignore
  secure.id = 'not a number';
} catch (e: any) {
  console.log(e.message);              // 'Type Mismatch'
  console.log(e instanceof TypeError);  // true
}

// Access Denied - wrong receiver context
const upper = Object.create(secure);
try {
  upper.id = 2;
} catch (e: any) {
  console.log(e.message);                   // 'Value Access Denied'
  console.log(e instanceof ReferenceError);  // true
}

// Undefined Property - accessing non-existent
try {
  // @ts-ignore
  secure.nonExistent;
} catch (e: any) {
  console.log(e.message);
  // 'Attempt to Access to Undefined Prop: [ nonExistent ] for SecureData'
}

// Functions Restricted - methods on data objects
try {
  // @ts-ignore
  secure.name = function() {};
} catch (e: any) {
  console.log(e.message);              // 'Functions are Restricted'
}
```

---

## Advanced: Custom Fields

Use `FieldConstructor` to create custom property behavior.

```typescript
import { BaseClass, FieldConstructor, SymbolInitialValue } from 'typeomatica';

// Read-only field implementation
class ReadOnlyField extends FieldConstructor<string> {
  private _value: string;
  
  constructor(value: string) {
    super(value);
    this._value = value;
    // Make enumerable for Object.keys()
    Reflect.defineProperty(this, 'enumerable', { value: true });
  }
  
  get() {
    return this._value;
  }
  // No set() method = read-only
}

// Usage
const readOnly = new ReadOnlyField('v1.0.0');

class Config extends BaseClass {
  version = readOnly;
}

const cfg = new Config();
console.log(cfg.version);  // 'v1.0.0'

try {
  cfg.version = 'v2.0.0';  // ✗ Throws!
} catch (e: any) {
  console.log(e.message);  // 'Re-Assirnment is Forbidden'
}

// Access initial value
const initial = cfg[SymbolInitialValue]('version');
console.log(initial);  // 'v1.0.0'
```

---

## Complete Integration Example

Full example combining mnemonica's inheritance with typeomatica's runtime safety.

```typescript
import { decorate, define, apply } from 'mnemonica';
import { BaseClass, Strict } from 'typeomatica';

// ==========================================
// Base entity with runtime type safety
// ==========================================
@decorate()
@Strict()
class Entity extends BaseClass {
  id: string = '';
  createdAt: Date = new Date();
  
  constructor() {
    super();
  }
}

// ==========================================
// User type extending Entity
// ==========================================
const User = Entity.define('User', function(this: { 
  email: string; 
  name: string;
  role: string;
}) {
  this.email = '';
  this.name = '';
  this.role = 'user';
});

// ==========================================
// Admin type extending User
// ==========================================
const Admin = User.define('Admin', function(this: {
  permissions: string[];
}) {
  this.permissions = [];
  this.role = 'admin';  // Override parent default
});

// ==========================================
// Create instances with full type safety
// ==========================================
const entity = new Entity();
const user = new User();
const admin = new Admin();

// Runtime type enforcement prevents bugs
user.email = 'john@example.com';     // ✓ Works
// @ts-ignore
user.email = 123;                    // ✗ TypeError: Type Mismatch

// Inheritance chain works with type safety
const promotedUser = apply(user, Admin);
promotedUser.permissions = ['read', 'write'];  // ✓ Works
// @ts-ignore
promotedUser.permissions = 'all';                // ✗ TypeError: Type Mismatch

// Using valueOf() for operations
const id = entity.id.valueOf();  // Get raw string value
```

---

## Error Reference

| Error Message | Error Type | When Thrown |
|---------------|------------|-------------|
| `Type Mismatch` | TypeError | Assigning wrong type to property (e.g., string to number field) |
| `Value Access Denied` | ReferenceError | Accessing property from wrong context/receiver |
| `Attempt to Access to Undefined Prop` | Error | Reading property that doesn't exist on the object |
| `Functions are Restricted` | TypeError | Assigning function to data type property |
| `Re-Assirnment is Forbidden` | TypeError | Modifying read-only field (FieldConstructor without setter) |
| `Setting prototype is not allowed` | Error | Calling `Object.setPrototypeOf()` on instance |
| `Defining new Properties is not allowed` | Error | Calling `Object.defineProperty()` on instance |
| `Properties Deletion is not allowed` | Error | Calling `delete` on instance property |

---

## Benefits Summary

| Feature | TypeScript | TypeØmatica | Mnemonica |
|---------|------------|-------------|-----------|
| Compile-time type checking | ✓ | — | — |
| Runtime type enforcement | — | ✓ | — |
| Prototype inheritance | — | — | ✓ |
| Type composition | Limited | — | ✓ |
| Hooks system | — | — | ✓ |

**Combined Benefits:**
- **TypeScript**: Catches errors during development
- **TypeØmatica**: Prevents runtime type mutations
- **Mnemonica**: Provides flexible prototype-based inheritance

Together, they provide complete type safety from development through production.
