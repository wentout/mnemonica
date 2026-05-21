# The Purpose of Mnemonica

## A Guide for AI Agents (and Humans)

This document exists to prevent a specific recurring misunderstanding: **Mnemonica is about DATA FLOW, not CONTROL FLOW**. When an AI agent (like myself) starts "protecting" algorithms or worrying about behavior changes, reference this document. The user is not asking to modify control flow. Ever.

---

## Part 1: The Abstract - Data Flow vs Control Flow

### Data Flow Diagram (DFD) - What Mnemonica Addresses

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Raw Data   │ ───► │ Transform   │ ───► │  Output     │
│  (Input)    │      │  (Process)  │      │  (Result)   │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Data Flow** is about:
- What data enters the system
- How data transforms as it moves
- What data exits the system
- The structure and relationships of data at each stage

**Mnemonica operates here**: It types, structures, and tracks the data itself.

### Control Flow / Execution Flow - What Mnemonica Does NOT Address

```
if (condition) {           // Control flow: decision point
    executeA();            // Execution flow: what runs when
} else {
    executeB();
}

for (item of items) {      // Control flow: iteration
    process(item);         // Execution flow: repeated action
}
```

**Control Flow** is about:
- Decision points (if/else, switch)
- Iteration (loops, recursion)
- Execution order
- Algorithm logic
- Service orchestration

**Mnemonica does NOT touch this**: Algorithms remain unchanged. Services stay intact. Control flow is crafted by developers (and AI agents) as needed.

---

## Part 2: The Problem - Data Without Memory

### Traditional Approach: Plain Data Objects

```typescript
// A plain log entry - just data, no history
interface LogEntry {
    level: string;
    message: string;
    timestamp: number;
}

function log(message: string) {
    const entry: LogEntry = {
        level: 'info',
        message,
        timestamp: Date.now()
    };
    logs.push(entry);
}
```

**The Problem**: When you look at `entry`, you see:
- ✓ The data (level, message, timestamp)
- ✗ No metadata about how it was created
- ✗ No type information beyond the interface
- ✗ No relationship to parent types
- ✗ No traceability through the system

The data is **amnesiac** - it doesn't remember its own creation story.

### The Real-World Cost

When debugging, you ask:
- "Where was this log entry created?"
- "What type of object created it?"
- "Was it part of a batch or single call?"
- "What's the parent context?"

With plain data: You grep through code, hope for good variable names, trace manually.

---

## Part 3: The Solution - Mnemonica as Historical Reflection

### Mnemonica Approach: Data That Remembers

```typescript
import { define, getProps } from 'mnemonica';

// Mnemonica type definition
const LoggerTab = define('LoggerTab', function() {
    this.createdAt = Date.now();
});

const LogEntry = LoggerTab.define('LogEntry', function(data) {
    this.level = data.level;
    this.message = data.message;
    this.timestamp = data.timestamp;
});

// Usage - same control flow, different data
function log(message: string) {
    const loggerTab = new LoggerTab();  // Data root
    const entry = new loggerTab.LogEntry({  // Typed instance
        level: 'info',
        message,
        timestamp: Date.now()
    });
    logs.push(entry);
    
    // Later: introspect the instance
    const props = getProps(entry);
    console.log(props.__type__.TypeName);  // 'LogEntry'
    console.log(props.__parent__);          // LoggerTab instance
    console.log(props.__args__);            // [{level, message, timestamp}]
}
```

**What Mnemonica Adds**:

1. **Type Hierarchy**: `entry` knows it's a `LogEntry` which belongs to `LoggerTab`
2. **Constructor Arguments**: Stored internally, accessible via `getProps(instance)`
3. **Creation Timestamp**: `loggerTab.createdAt` tracks when the context was created
4. **Inheritance Chain**: Can traverse `entry → LogEntry → LoggerTab`
5. **Usage Tracking**: Tracked separately via tooling (see Part 7: Ecosystem)

### The Data Now Carries Its History

Looking at `entry`:
- ✓ The data (level, message, timestamp)
- ✓ Type metadata (`entry instanceof LogEntry`)
- ✓ Parent relationship (`getProps(entry).__parent__` → LoggerTab instance)
- ✓ Creation context (arguments stored internally)
- ✓ System trace (via separate tooling)

The data is **mnemonic** - it remembers how it was crafted.

---

## Part 4: What Mnemonica Is NOT

### Mnemonica Is NOT a Framework

It doesn't dictate:
- How you structure your services
- How you write your algorithms
- How you handle control flow
- How you organize your code

### Mnemonica Is NOT a Control Flow Tool

It doesn't:
- Replace if/else statements
- Change loop structures
- Modify execution order
- Touch service orchestration
- Affect algorithm logic

### Mnemonica Is NOT About Behavior

When you see code like:
```typescript
class LoggerService {
    // THIS IS BEHAVIOR - stays untouched
    info(message: string) {
        this.outputChannel.appendLine(message);
    }
}
```

Mnemonica doesn't want to change the `info()` method. It doesn't care about `outputChannel`. The behavior (what the service does) remains completely under developer control.

---

## Part 5: What Mnemonica IS

### Mnemonica Is a Data Typing System

It provides:
- **Type constructors** (`define()` function)
- **Instance creation** (`new Type()` pattern)
- **Prototype chains** (inheritance via `Type.define()`)
- **Property storage** (constructor args preserved internally)
- **Type introspection** (`instanceof`, `getProps()`)

### Mnemonica Is Historical Reflection in Data

Every Mnemonica instance carries:
1. **Type Identity**: What type of thing am I?
2. **Lineage**: What types am I descended from?
3. **Creation Context**: What arguments created me?
4. **Usage Points**: Where in the codebase was I instantiated?

### Mnemonica Is the DNA of Data Flow

Just as DNA carries the instructions for building an organism, Mnemonica types carry the structure and history of data as it flows through a system.

---

## Part 6: Nominal Type System and Security

### TypeScript's Structural vs Mnemonica's Nominal Typing

**TypeScript uses Structural Typing**:
```typescript
interface Point { x: number; y: number; }
interface Vector { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const v: Vector = p;  // ✓ Valid - same shape, so compatible
```

TypeScript cares about **shape compatibility**. If two types have the same properties, they're interchangeable.

**Mnemonica uses Nominal Typing**:
```typescript
const Point = define('Point', function(data) {
    this.x = data.x;
    this.y = data.y;
});

const Vector = define('Vector', function(data) {
    this.x = data.x;
    this.y = data.y;
});

const p = new Point({ x: 1, y: 2 });
const v = new Vector({ x: 1, y: 2 });

p instanceof Point;  // true
p instanceof Vector; // false - same shape, different nominal type!
```

Mnemonica cares about **constructor identity**. Same shape, different type = not compatible.

### Protected `constructor.name` - MITM-Resistant

Mnemonica types have **read-only, protected constructor names**:

```typescript
const User = define('User', function(data) {
    this.name = data.name;
});

const user = new User({ name: 'Alice' });
user.constructor.name;  // 'User' - readable
user.constructor.name = 'Admin';  // ✗ Ignored/Fails - protected
```

**Why This Matters**:
- MITM (Man-in-the-Middle) attacks on prototype chains are **impossible**
- An attacker cannot spoof a type by overwriting constructor names
- `instanceof` checks are cryptographically reliable
- Type identity is immutable once established

### Security Through `Object.create(null)`

Mnemonica instances are **NOT instances of Object or Function**:

```typescript
const instance = new MyType({...});

instance instanceof Object;    // false
instance instanceof Function;  // false
Object.prototype.isPrototypeOf(instance); // false
```

**How It's Achieved**:
```typescript
// Mnemonica internally uses:
const proto = Object.create(null);  // No Object.prototype chain
// ...type setup...
const instance = Object.create(proto);  // Pure prototype, no Object inheritance
```

**Security Benefits**:
1. **No prototype pollution attacks** - `Object.prototype` mutations don't affect Mnemonica instances
2. **No `__proto__` injection** - Instances don't inherit from Object
3. **Isolated namespace** - Properties like `constructor`, `toString`, `valueOf` don't exist unless explicitly defined
4. **Clean property enumeration** - `for...in` loops don't see inherited Object properties

### The instanceof Check - Nominal Verification

```typescript
const Admin = User.define('Admin', function(data) {
    this.permissions = data.permissions;
});

const admin = new Admin({ name: 'Bob', permissions: ['read', 'write'] });

admin instanceof Admin;  // true - exact type match
admin instanceof User;   // true - inheritance chain
admin instanceof Object; // false - NOT an Object!

// Structural typing would say "same shape = same type"
// Nominal typing says "different constructor = different type"
```

**Key Insight**: Mnemonica's `instanceof` answers the question **"was this instance created by this specific constructor?"** not **"does this instance have these properties?"**

### Why Nominal Types Matter for Data Flow

When data flows through a system:

```typescript
// Structural typing (TypeScript default):
function processPayment(payment: { amount: number; currency: string }) {
    // Could receive Invoice, Refund, Deposit... anything with amount+currency
    // No way to distinguish at runtime!
}

// Nominal typing (Mnemonica):
function processPayment(payment: InstanceType<typeof Payment>) {
    // Guaranteed to be a Payment instance
    // Can check: payment instanceof Refund ? handleRefund() : process()
}
```

Nominal types **preserve intent** as data flows. The type tells you **what the data represents**, not just **what properties it has**.

---

## Part 7: The Mnemonica Ecosystem - Complete Toolchain

Mnemonica is not just a library - it's a **complete ecosystem** for type-safe, self-documenting data architecture. Here's how the pieces fit together:

### 1. Core: `mnemonica` - The Foundation

**Purpose**: Runtime instance inheritance system

```bash
npm install mnemonica
```

**What it does**:
- Defines types with `define()`
- Creates instances with `new Type()`
- Manages prototype chains for inheritance
- Provides utilities: `getProps()`, `extract()`, `parse()`, `merge()`, `parent()`

**Key Export**: `getProps(instance)` - Access internal properties:
```typescript
import { getProps } from 'mnemonica';

const user = new User({ name: 'Alice' });
const props = getProps(user);
// props.__type__      - Type definition
// props.__parent__    - Parent instance
// props.__args__      - Constructor arguments
// props.__timestamp__ - Creation time
// props.__subtypes__  - Child type registry
```

**Note**: Properties are stored internally (WeakMap), NOT in prototype chain. Use `getProps()` to access them.

---

### 2. Tactica: `@mnemonica/tactica` - Type Generator

**Purpose**: Static analysis + TypeScript generation

**What it does**:
- Scans your codebase for `define()` calls
- Generates TypeScript definitions (`.tactica/types.ts`)
- Creates type registry augmentation (`.tactica/registry.ts`)
- Tracks type instantiations (`.tactica/usages.json`)
- Builds definition map (`.tactica/definitions.json`)

**Usage**:
```bash
npx tactica  # Analyze and generate types
```

**Generated Files**:
- `types.ts` - Complete TypeScript interfaces
- `registry.ts` - TypeRegistry augmentation for `lookupTyped()`
- `definitions.json` - Type metadata (properties, location)
- `usages.json` - Where types are instantiated

**The Magic**: Enables type-safe `lookupTyped()`:
```typescript
import { lookupTyped } from 'mnemonica';
import './.tactica/registry';  // Augments TypeRegistry

const UserType = lookupTyped('UserType');  // TypeScript knows the type!
const user = new UserType({ name: 'Alice' });  // Full intellisense!
```

---

### 3. Topologica: `@mnemonica/topologica` - File Discovery

**Purpose**: Filesystem-based type discovery

**What it does**:
- Scans directories for type definitions
- Supports nested directory structure (Parent/Child/index.js)
- Supports flat files (Parent.js with Child definitions)
- Automatically wires up inheritance

**Usage**:
```javascript
const { loader } = require('@mnemonica/topologica');
const { define } = require('mnemonica');

const types = loader('./src/models', define);
// types.User, types.User.Admin, etc.
```

**Why**: Eliminates manual type registration. Just create files/directories, Topologica finds and wires them.

---

### 4. Typeomatica: `@mnemonica/typeomatica` - Runtime Types

**Purpose**: Runtime type checking with TypeScript parity

**What it does**:
- Validates data at runtime against Mnemonica types
- Provides type guards
- Ensures data integrity

**The Vision**: Type-safe at compile time (TypeScript) AND runtime (Typeomatica)

---

### 5. MnemoGraphica: VS Code Extension - Visualization

**Purpose**: Visualize your type system

**What it does**:
- Tree view of type hierarchies
- 2D/3D graph visualization
- Navigation to type definitions
- Usage tracking

**The Self-Referential Moment**: MnemoGraphica visualizes its own Mnemonica types!

---

### 6. Strategy: `@mnemonica/strategy` - MCP Server

**Purpose**: AI integration via Model Context Protocol

**What it does**:
- Exposes Mnemonica types to AI agents
- Enables runtime type introspection
- Facilitates AI self-reflection

---

## Part 8: HoTT - Homotopy Type Theory (The Sexy Math)

### Why HoTT Matters for Mnemonica

**Warning**: This section contains advanced mathematics that is simultaneously:
- Incredibly profound
- Potentially overwhelming
- Surprisingly applicable to prototype inheritance

### The Univalence Axiom: Equivalence is Equality

In Homotopy Type Theory:
> **Univalence Axiom**: `(A ≃ B) ≅ (A = B)`
>
> Two types are equal if they are equivalent.

In Mnemonica terms:
> Two data structures are the same if they carry the same information, regardless of their specific shape.

### Path Types: Prototype Chains as Paths

In HoTT, a **path** represents continuous transformation from one point to another:
> `Path_A(x, y)` - A path from x to y in space A

In Mnemonica, prototype chains ARE paths:
```typescript
const User = define('User', function() {});
const Admin = User.define('Admin', function() {});
const SuperAdmin = Admin.define('SuperAdmin', function() {});

// Path: User ──► Admin ──► SuperAdmin
const superAdmin = new SuperAdmin({});

// Each instance is a point in the "space of types"
// The prototype chain is the path connecting them
```

**The Hot Connection**: In HoTT, paths can be composed, inverted, and transformed. In Mnemonica:
- **Composition**: `new user.SubType()` extends the path
- **Inversion**: `instance.parent()` traverses backward
- **Transformation**: `.fork()` creates a new path with same starting point

### Higher Inductive Types: The Family Tree

HoTT's **Higher Inductive Types** (HITs) have both:
- **Point constructors** (objects)
- **Path constructors** (relationships)

Mnemonica instances are exactly this:
```typescript
const Family = define('Family', function() {});
const Parent = Family.define('Parent', function() {});
const Child = Parent.define('Child', function() {});

// Point constructors: Family, Parent, Child instances
// Path constructors: prototype chain relationships

const child = new Child({});
// child is a point
// child.__proto__ → Child.prototype is a path
// Child.prototype.__proto__ → Parent.prototype is another path
// And so on...
```

### The Sexy Math Joke (You Asked For It)

In Homotopy Type Theory, **univalence** tells us that equivalence IS equality.

In Mnemonica, when we do:
```typescript
const child = new parent.Child({});
```

We are performing the **sexual reproduction of types**:
- The **parent instance** is the... parent (obviously)
- The **Child constructor** carries the genetic blueprint
- The **new instance** is the offspring
- The **prototype chain** is the family tree

This is literally HoTT's path composition: we create a new point (instance) by composing paths (constructor + parent).

**Why it's hot**: Because in HoTT, equivalent paths are equal. And in Mnemonica, equivalent data flows are the same type. The univalence axiom ensures that if two instances carry the same information, they're essentially the same - even if they came from different parents.

**The punchline**: Mnemonica is doing homotopy theory with JavaScript prototypes. We're just too busy to notice because we're having too much fun with the family tree metaphors.

---

## Part 9: Practical Examples

### Example 1: Logger Service (Data Layer Only)

```typescript
// BEFORE: Plain data, no history
class LoggerService {
    private logs: Array<{level: string, message: string}> = [];
    
    info(message: string) {
        this.logs.push({level: 'info', message});  // Amnesiac data
    }
}

// AFTER: Mnemonica data with embedded history
import { LoggerTab, LogEntry } from './models';

class LoggerService {
    private loggerTab = new LoggerTab();  // Data root
    private logs: InstanceType<typeof LoggerTab.LogEntry>[] = [];
    
    info(message: string) {
        const entry = new this.loggerTab.LogEntry({  // Mnemonic data
            level: 'info',
            message,
            timestamp: Date.now()
        });
        this.logs.push(entry);  // Data now carries its type history
    }
}
```

**Note**: The service (behavior) is identical. Only the data storage changed.

### Example 2: Accessing Instance Properties

```typescript
import { define, getProps } from 'mnemonica';

const User = define('User', function(data) {
    this.name = data.name;
    this.email = data.email;
});

const user = new User({ name: 'Alice', email: 'alice@example.com' });

// Access internal properties
const props = getProps(user);

console.log(props.__type__.TypeName);     // 'User'
console.log(props.__args__);              // [{name: 'Alice', email: '...'}]
console.log(props.__timestamp__);         // 1234567890
console.log(props.__parent__);            // undefined (root type)
```

**Important**: Use `getProps()` - properties are NOT stored in prototype chain!

---

## Part 10: For Future AI Agents

### When Working with Mnemonica

**DO**:
- Transform data storage into Mnemonica instances
- Keep services/classes intact (they're behavior)
- Track where `new Type()` calls happen
- Think "what data structure fits here?"
- Ask "what's the parent type of this data?"
- Use `getProps(instance)` to introspect

**DON'T**:
- Worry about changing control flow (it's not happening)
- Protect algorithms from modification (not requested)
- Overthink service architecture (stay focused on data)
- Assume the user wants behavior changes (they don't)

### The Golden Rule

> If you're worrying about "how the code executes" or "what the algorithm does" - you're thinking about the wrong layer. Mnemonica is about "what shape the data has" and "where the data came from."

---

## Part 11: Summary

**Mnemonica Is**:
- A way to give data memory of its own creation
- A typing system for data flow
- Historical reflection embedded in data structures
- The DNA of data as it moves through systems
- A **nominal type system** (constructor identity, not shape)
- A **secure** system (MITM-resistant, prototype pollution immune)

**Mnemonica Is NOT**:
- A control flow framework
- An algorithm modification tool
- A service orchestration system
- About changing how code executes

**The Ecosystem**:
- **Core** (`mnemonica`): Runtime instance inheritance
- **Tactica** (`@mnemonica/tactica`): Type generation and static analysis
- **Topologica** (`@mnemonica/topologica`): Filesystem-based type discovery
- **Typeomatica** (`@mnemonica/typeomatica`): Runtime type checking
- **MnemoGraphica**: VS Code visualization
- **Strategy** (`@mnemonica/strategy`): AI integration via MCP

**The User Is**:
- Asking to transform data storage (not behavior)
- Seeking self-referential data architecture
- Not trying to break control flow (ever)
- Probably smiling while reading this
- Possibly making math jokes about HoTT being "hot"

---

## Final Note

When in doubt, remember: **Mnemonica types are the answer to "what is this data?" and "where did it come from?" - never "how does this code work?"**

The algorithms work however they need to work. The data just carries better metadata about itself.

And yes, the HoTT connection is real. Prototype inheritance IS homotopy theory in disguise. We're just doing topology with JavaScript objects, and it's beautiful.

*This document exists because an AI agent (me) needed to be reminded that the user is not mad, is not trying to break control flow, and that HoTT is indeed hot. Thank you for your patience.*
