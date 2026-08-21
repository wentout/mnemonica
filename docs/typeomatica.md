# TypeØmatica Integration Guide

**Strict Runtime Type Checking for Mnemonica**

TypeØmatica is a companion library that provides strict runtime type checking for JavaScript objects using Proxy-based interception. It enforces type safety at runtime exactly as TypeScript expects at compile time.

---

## Table of Contents

- [What is TypeØmatica?](#what-is-typeømatica)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Integration Patterns](#integration-patterns)
- [Complete Integration Example](#complete-integration-example)
- [Benefits Summary](#benefits-summary)

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

The full typeomatica API — `BaseClass`, `BasePrototype`, the `@Strict()` decorator and its options, `FieldConstructor`, `SymbolTypeomaticaProxyReference`, `SymbolInitialValue`, and the complete error reference (`Type Mismatch`, `Value Access Denied`, and friends) — is documented in the typeomatica package itself:

**<https://www.npmjs.com/package/typeomatica>**

The sections below cover only what you need to combine typeomatica with mnemonica.

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

const premiumCustomer = new Customer();
const premium = new premiumCustomer.PremiumCustomer();
// @ts-ignore
premium.tier = 123;  // ✗ TypeError: Type Mismatch
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
const user = new entity.User();       // subtypes construct from a parent instance
const admin = new user.Admin();

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
