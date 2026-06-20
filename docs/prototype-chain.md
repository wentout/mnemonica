# The Prototype Chain

Every mnemonica instance is the tip of a private prototype chain. This document explains what that chain looks like, what the intermediate layers do, and why they are necessary.

---

## A normal class chain vs a mnemonica chain

In normal JavaScript classes:

```js
const alice = new Employee({ name: 'Alice' });
// alice → Employee.prototype → Object.prototype
```

Every `Employee` instance shares the same `Employee.prototype`. If one request mutates that prototype, all instances are affected.

In mnemonica:

```js
const UserType = define('UserType', function (data) {
  Object.assign(this, data);
});

const user = new UserType({ name: 'Alice' });
const admin = new user.AdminType({ role: 'admin' });
const superadmin = new admin.SuperAdminType({ level: 9000 });
```

Each instance has its own fresh prototype objects above it. The chain for `superadmin` is:

```
superadmin
  └── SuperAdminType.prototype
        └── SuperAdmin memory layer
              └── admin
                    └── AdminType.prototype
                          └── Admin memory layer
                                └── user
                                      └── UserType.prototype
                                            └── User memory layer
                                                  └── root Mnemosyne proxy
```

---

## What each layer does

### 1. The instance itself

This is the object returned by `new user.AdminType(...)`. It holds only the properties your constructor assigned:

```js
superadmin.level === 9000;
admin.role === 'admin';
user.name === 'Alice';
```

### 2. The user prototype layer

This layer holds the methods and getters you put on the type when you defined it:

```js
const AdminType = UserType.define('AdminType', function (data) {
  Object.assign(this, data);
}, {
  proto: {
    isAdmin() { return true; }
  }
});
```

`admin.isAdmin()` resolves on this layer. This prototype is **fresh per instance**, so one `admin` cannot pollute the prototype of another.

### 3. The memory layer

This is the invisible layer that makes mnemonica work. It:

- stores the internal construction context (`__type__`, `__parent__`, `__args__`, `__timestamp__`, etc.) in a `WeakMap`, keyed by this layer;
- provides `constructor` so `admin.constructor.name === 'AdminType'`;
- links the instance to its parent instance, so `admin instanceof UserType` works.

Because the props live in a `WeakMap` attached to the memory layer, they do **not** show up in `Object.keys(instance)` or `JSON.stringify(instance)`.

For async constructors, the memory layer also receives a `__self__` marker after the Promise resolves. This lets mnemonica defer finalization until the async work is done without running validation and hooks twice.

---

## Why three layers per type?

Normal JavaScript collapses these into one shared `prototype`. mnemonica separates them for three reasons:

1. **Isolation.** Each construction gets fresh prototype objects, so mutations cannot leak between instances or between concurrent requests.
2. **Identity-as-path.** The parent instance is physically in the prototype chain. `admin instanceof UserType` is true because `admin`’s chain walks up to the exact `user` instance it came from, not to a shared class prototype.
3. **Clean enumeration.** Internal metadata is stored in a `WeakMap` keyed by the memory layer, not as own properties on the instance.

---

## Subtype lookup

When you write `admin.SuperAdminType`, JavaScript walks the prototype chain until it reaches the **root Mnemosyne proxy**. That proxy looks up `SuperAdminType` in the type’s `__subtypes__` Map and returns a `SubTypeProxy`. When you call `new` on it, the proxy creates the new chain with `admin` as the parent.

Only the root has a Proxy. All intermediate memory layers are plain objects; the root Proxy handles lookups for the whole branch.

The Proxy is kept for an important reason: **subtypes can be defined after an instance already exists**, and the Proxy makes those new subtypes visible on existing instances by doing a live lookup in the type’s `__subtypes__` Map. If subtype constructors were attached to the memory layer at construction time, old instances would miss any subtypes added later.

---

## Your constructor’s `.prototype` is untouched

When you call `define('AdminType', AdminConstructor)`, mnemonica takes a snapshot of `AdminConstructor.prototype`. During each construction it copies that snapshot onto a fresh `AdminType.prototype`. The original `AdminConstructor.prototype` is restored afterward. This is why you can reuse the same constructor function for several type definitions without cross-contamination.

---

## Classes and functions produce the same chain

Whether you define a type with a `function` or a `class`, the final chain has the same shape. For classes, mnemonica generates a wrapper class that extends your class so `super()` works; after construction it rewires the chain to the same three-layer form.

---

## Summary

- Each instance sits on a private, per-construction prototype stack.
- The visible layer is the user prototype (methods and getters).
- The invisible layer is the memory layer (internal props, parent link, constructor).
- The root has a Proxy that answers all subtype lookups for its branch.
- This design makes `instanceof`, `parent`, and path-based identity correct while keeping instance enumeration clean.
