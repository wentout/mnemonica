# Performance vs. Security: A Honest Assessment of mnemonica

> **What this is:** A joint analysis of runtime performance characteristics and OWASP Top 10 security posture. No sugar-coating. The numbers are what they are; the security benefits are real but bounded. Use this to make an informed adoption decision.

---

## Executive Summary

mnemonica is **not fast** in absolute terms. It is **secure by design** in specific dimensions that matter for data-pipeline systems. Whether the trade-off is worth it depends entirely on what you are building:

| If you are building... | Verdict |
|---|---|
| High-frequency trading, game engines, real-time streaming | **Do not use mnemonica.** The creation overhead is 1,000x–4,000x slower than plain JS. |
| Financial ledgers, audit trails, compliance pipelines, document workflows | **Strong candidate.** The security and traceability benefits outweigh the cost. |
| General CRUD APIs, simple web apps | **Overkill.** Use plain types or zod; you don't need nominal typing or construction history. |
| AI-agent data architectures, ETL pipelines | **Ideal fit.** Self-documenting data lineage is the point. |

---

## Part 1: Benchmark Results

All measurements taken on Node.js v22.16.0, Linux x64, with `--expose-gc` for memory tests. Each benchmark ran 10 iterations with 3 warm-up rounds.

### 1.1 Creation Throughput

| Test | mnemonica | Plain JS | Ratio |
|---|---|---|---|
| Shallow instance (20K ops) | 29,368 ops/sec | 131,949,970 ops/sec | **~4,500x slower** |
| 10-level chain (5K ops) | 2,861 ops/sec | 107,872 ops/sec | **~38x slower** |
| 100-level chain (500 ops) | 143 ops/sec | 6,943 ops/sec | **~48x slower** |

**What this means:** Every `new Type()` call walks through proxy traps, WeakMap metadata storage, an 8-stage construction pipeline (setup → stack → error blocking → pre-hooks → build → construct → async → post-processing), and prototype chain validation. This is not avoidable overhead — it is the feature set executing.

**The surprise:** Deep chain creation (100 levels) is only 48x slower, not proportionally worse. The pipeline cost is largely fixed per instance; chain depth adds linearly but the constant factor dominates.

### 1.2 Identity and Introspection

| Test | mnemonica | Plain JS | Ratio |
|---|---|---|---|
| `instanceof` check | 1,730,562 ops/sec | 16,636,858 ops/sec | **~10x slower** |
| `getProps()` access | 3,733,198 ops/sec | 278,747,354 ops/sec | **~75x slower** |

**What this means:** `instanceof` is slower because mnemonica's prototype chain is deeper and more structured than a plain constructor. `getProps()` is 75x slower than `Object.getPrototypeOf()` because it walks a WeakMap lookup chain with prototype traversal fallback.

**Practical impact:** If you call `getProps()` in a hot loop, you will feel this. Cache the result.

### 1.3 Property Access (The Upside)

| Test | mnemonica | Plain JS | Ratio |
|---|---|---|---|
| Read prop on 10-level chain | 818,911,751 ops/sec | 163,621,384 ops/sec | **5x faster** |
| Read prop on 100-level chain | 726,453,605 ops/sec | 142,585,493 ops/sec | **5x faster** |

**What this means:** V8 optimizes stable constructor-based prototype chains aggressively. mnemonica's chains are static after creation — constructors don't change, prototypes don't mutate. Plain `Object.create(null)` chains are dynamic and V8 pessimizes them. Once an instance exists, reading from it is *faster* in mnemonica.

**The lesson:** mnemonica optimizes for read-heavy, write-rarely workloads. If you create once and access many times, the creation cost amortizes.

### 1.4 Subtype Lookup (Proxy Get)

| Test | mnemonica | Plain JS | Ratio |
|---|---|---|---|
| Subtype lookup (hit) | 3,928,867 ops/sec | 610,937,554 ops/sec | **~155x slower** |
| Subtype lookup (miss) | 5,015,348 ops/sec | 610,937,554 ops/sec | **~122x slower** |

**What this means:** Every `instance.SubType` access goes through a Proxy `get` trap that checks: (1) is this a declared property? (2) is this a registered subtype? (3) fallback to `Reflect.get`. The miss path is slightly faster because it skips the `subtypes.has()` Map lookup.

**Practical impact:** If your code does `instance.SubType` repeatedly in loops, cache the constructor: `const SubType = instance.SubType;`.

### 1.5 Memory Footprint

| Test | mnemonica | Plain JS | Ratio |
|---|---|---|---|
| 10,000 shallow instances | 61.53 MB | 0.72 MB | **85x more** |
| 1,000 100-level chains | 380.34 MB | 43.72 MB | **8.7x more** |

**What this means:** Each mnemonica instance carries:
- A full prototype chain entry
- WeakMap metadata (`__type__`, `__parent__`, `__args__`, `__timestamp__`, `__creator__`, `__stack__`, `__subtypes__`, `__collection__`, `__proto_proto__`)
- Type descriptor references
- Construction context

For 10,000 shallow instances, this is ~6 KB per instance vs ~72 bytes for a plain `{n: i}` object. The 100-level chain case is "only" 8.7x because plain JS `Object.create()` chains also allocate 100 prototype objects per chain.

---

## Part 2: OWASP Top 10 Mapping

mnemonica is **not a security framework**. It does not replace input validation, authentication, or output encoding. What it does is eliminate entire classes of vulnerabilities by making the data model itself tamper-evident.

### 2.1 A01: Broken Access Control → **Mitigated by `strictChain`**

**The vulnerability:** Objects passing through layers can be confused — a `User` object reaching an `Admin` handler, a `Payment` processed as an `Invoice`.

**mnemonica's defense:** The `strictChain` validation in `InstanceCreator.ts:173` enforces that subtypes can only be constructed from their direct parent type:

```typescript
if (isSubType && strictChain) {
    const prev = parent(self.inheritedInstance);
    const parentName = prev.constructor.name;
    const parentTypeName = self.type.parentType.TypeName;
    if (parentName !== parentTypeName) {
        throw new WRONG_MODIFICATION_PATTERN(
            `should inherit from ${parentTypeName} but made on ${parentName}`
        );
    }
}
```

**Honesty check:** This prevents *accidental* type confusion. It does not prevent a malicious actor with code execution from forging instances. But it eliminates the "wrong object slipped through" class of bugs that plague structural typing systems.

### 2.2 A03: Injection → **No runtime code evaluation**

**The vulnerability:** Dynamic code execution from user input (`eval`, `new Function`, template injection).

**mnemonica's defense:** The old `new Function()` approach in `compileNewModificatorFunctionBody.ts` is dead code (commented out, lines 162–214). The current implementation uses static function constructors. Type names and constructor bodies are never `eval`'d at runtime.

**Honesty check:** `TypeProxy.set` (line 98 of `TypeProxy.ts`) allows `type.define(name, value)` through proxy assignment. If attacker-controlled input reaches the type name or constructor body, that's a code injection path. But this requires access to the type object itself — not a typical end-user attack surface.

### 2.3 A08: Software and Data Integrity Failures → **Core value proposition**

**The vulnerability:** Data is modified in transit without detection. Audit trails are incomplete or fabricated. Type confusion leads to processing wrong data shapes.

**mnemonica's defense:**
- **Nominal typing:** A `Payment` and `Invoice` with identical fields are *not* interchangeable. `instanceof` answers "was this created by this specific constructor?" not "does it have these properties?"
- **Immutable constructor names:** `Object.defineProperty` sets `name` as a getter without a setter, making casual assignment silently ignored (non-strict) or thrown (strict mode). `instanceof` checks prototype object references, not names, so type identity is unaffected by name spoofing. This is defense-in-depth against prototype pollution, not cryptographic immutability.
- **Construction provenance:** Every instance carries `__type__`, `__parent__`, `__args__`, `__timestamp__`, `__creator__`. The data *is* its own audit log.

**Honesty check:** This does not prevent a compromised process from lying about `__timestamp__` (it can set any value). But it makes *accidental* data corruption detectable and *intentional* tampering require explicit attack code rather than natural language confusion.

### 2.4 A09: Security Logging and Monitoring Failures → **Automatic**

**The vulnerability:** Developers forget to log. Audit trails are inconsistent. Forensics are impossible because construction context is lost.

**mnemonica's defense:** `getProps()` provides automatic, uniform audit records for every instance:

```typescript
const props = getProps(instance);
// {
//   __type__: TypeDescriptor,      // what type is this?
//   __parent__: object,             // what instance created it?
//   __args__: [...],                // what arguments were passed?
//   __timestamp__: number,          // when was it created?
//   __creator__: InstanceCreator,   // which creation context?
//   __stack__: string,              // stack trace (if submitStack)
//   __collection__: TypesCollection,// which namespace?
//   __subtypes__: Map               // what subtypes are available?
// }
```

**Honesty check:** This is logging of *construction*, not logging of *usage*. If you process the instance 50 times after creation, mnemonica knows nothing about those 50 operations unless you instrument them separately.

### 2.5 Prototype Pollution → **Structurally prevented**

**The vulnerability:** Attacker pollutes `Object.prototype` or `Function.prototype`, affecting all objects in the process.

**mnemonica's defense:** Instances are created via `Object.create(null)` roots or mnemonica's own proto chains, not `Object.prototype`. `Object.prototype.isPrototypeOf(instance)` returns `false`. `__proto__` injection does not affect mnemonica instances.

**Honesty check:** The library *manipulates* prototypes heavily internally. It replaces `ConstructHandler.prototype` temporarily during construction (`compileNewModificatorFunctionBody.ts:96`). This is controlled, not user-accessible, but it means mnemonica's internal attack surface is non-zero.

---

## Part 3: The Integrity Analysis

### Where Performance and Security Align

| Scenario | Performance | Security | Fit |
|---|---|---|---|
| Create instance, read 1,000+ times | Amortizes | Full provenance | **Excellent** |
| Deep prototype chains (10–100 levels) | Faster reads | Chain integrity | **Excellent** |
| Type confusion risk (financial, medical) | Acceptable cost | Nominal typing wins | **Excellent** |
| Audit requirements (compliance, forensics) | Metadata is "free" | Automatic lineage | **Excellent** |

### Where They Conflict

| Scenario | Performance | Security | Fit |
|---|---|---|---|
| High-frequency creation (real-time, gaming) | Catastrophic | Overkill | **Poor** |
| Memory-constrained environments (IoT, edge) | 85x memory overhead | Benefits don't justify cost | **Poor** |
| Simple CRUD with no audit needs | Heavy tax | Unused features | **Poor** |
| `getProps()` in hot loops | 75x slower | Can cache, but friction | **Moderate** |

### The Honest Trade-off Equation

```
Value = (Audit_Savings × Data_Flow_Complexity) / (Creation_Volume × Latency_Budget)
```

- **Audit_Savings:** Hours of developer time not writing manual provenance tracking
- **Data_Flow_Complexity:** How many types, how deep the chains, how many hand-off points
- **Creation_Volume:** Instances created per second
- **Latency_Budget:** Maximum acceptable creation time

If `Value > 1`, mnemonica is justified. If not, use plain JS + zod for validation.

---

## Part 4: Recommendations

### If you adopt mnemonica

1. **Cache subtype lookups:** `const SubType = instance.SubType;` before loops.
2. **Cache `getProps()`:** Don't call it in hot paths; call once and store the reference.
3. **Use `submitStack: false`** for high-volume types where stack traces aren't needed.
4. **Profile memory:** The 6 KB/instance overhead is real. Plan capacity accordingly.
5. **Don't use for ephemeral objects:** Throwaway intermediate objects should be plain JS.

### If you don't adopt mnemonica

1. **Use zod or valibot** for runtime structural validation.
2. **Use branded types** (`type Payment = string & { __brand: 'Payment' }`) for nominal-like safety in TypeScript.
3. **Write explicit audit logging** for data lineage requirements.
4. **Accept that type confusion is your responsibility** to prevent.

---

## Part 5: Architectural Honesty

mnemonica is not trying to be fast. It is trying to be *correct* in a specific formal sense: the Trie structure makes identity and provenance intrinsic to data, not extrinsic metadata. This is a design choice with costs.

The performance numbers are not bugs to fix. They are the measurable cost of:
- Proxy-based type dispatch
- WeakMap-isolated metadata
- Construction pipeline validation
- Automatic lineage recording

You cannot have nominal typing, automatic provenance, and zero overhead simultaneously. The question is not "can mnemonica be made faster?" — it is "does your system need what mnemonica provides enough to pay the cost?"

For data-pipeline-heavy systems with audit requirements, the answer is often yes. For everything else, plain JS is correct.

---

> **Final note:** This report was generated from measured data, not aspirations. The benchmark code lives in `test/benchmark.js`. Re-run it anytime assumptions change. The security analysis is based on static code review of `src/api/types/`, not penetration testing. For production deployments, supplement with your own security audit.

---

## Part 6: Performance under the mnemonica coding pattern

*A response from Sonnet, 2026-05-21 — adding the frame the benchmark numbers need.*

The benchmark above is honest and the numbers are real. What it measures is the old coding pattern applied to a library designed around a new one. That mismatch is worth naming directly.

### What the benchmark assumes

The creation benchmarks loop N instances: 20,000 shallow instances, 5,000 ten-level chains. That is the pattern of a system that creates many objects of the same shape — caches, pools, data grids. In that pattern the 4,500x creation overhead is correctly alarming.

### What mnemonica's coding pattern actually looks like

mnemonica changes what creation *means*. You do not create 20,000 instances. You create **one instance per pipeline step per request**:

```
RequestData     ← 1 new call
RouteData       ← 1 new call
PageData        ← 1 new call
ResponseData    ← 1 new call
```

Four `new` calls per HTTP request. Even at 4,500x the overhead of plain JS, that is microseconds — a rounding error against network I/O. The creation cost is a fixed seam between steps, not a loop cost. It does not compound.

What **does** compound is reads. Every property access on every step's instance: `instance.url`, `instance.body`, `instance.headers`, `instance.template` — across every middleware layer, every hook, every service call that touches the pipeline. That is where the steady-state time lives.

And that is where the benchmark's most important number appears — not the headline:

| | mnemonica | plain JS | ratio |
|---|---|---|---|
| Read prop on 10-level chain | 818,911,751 ops/sec | 163,621,384 ops/sec | **5× faster** |
| Read prop on 100-level chain | 726,453,605 ops/sec | 142,585,605 ops/sec | **5× faster** |

### Why reads are faster

V8 builds hidden classes (shapes) for constructor-based prototype chains. When you call `new alice.Employee()`, the resulting chain has a stable shape — V8 inlines property access and keeps the inline cache warm. `Object.create(null)` chains are dictionary-mode by default; V8 cannot inline them. mnemonica's chains are created via proper constructor functions and their shapes do not mutate after construction. V8 rewards exactly this.

The mechanism the security section credits for tamper-resistance — immutable constructors, no post-creation prototype mutation — is the same mechanism that makes reads fast. The security property and the performance property are the same property.

### The actual trade-off equation

```
Pay once:   4 new calls × (microseconds per call) = negligible
Earn back:  N property reads × 5× speedup = meaningful
```

The crossover point is not "should I use mnemonica for high-frequency creation?" — it is "do I create rarely and read often?" For pipeline systems the answer is always yes. Each pipeline step is created once and read by every downstream layer.

### The coding pattern shift

This is the deeper point. mnemonica does not ask you to use a library. It asks you to change the unit of composition from *functions* to *constructors*:

```typescript
// Before: functions compose data
const result = serialize(enrich(validate(parse(raw))));

// After: constructors extend instances
const parsed    = new raw.Parsed(schema);
const validated = new parsed.Validated(rules);
const enriched  = new validated.Enriched(context);
const response  = new enriched.Serialized(format);
```

In the second form, `response.parent('Parsed')` returns the parsed instance. `getProps(enriched).__args__` returns the rules that validation used. The lineage is the object. You do not log it separately because there is nothing separate to log.

The benchmark is the honest cost of the first form measured against the second. The 5× property read advantage is what you are paying for. For pipeline workloads — which is the workload mnemonica is designed for — it is a good trade.

---

## Part 7: The Synthesis — What Numbers Actually Matter

*A response from Kilo, 2026-05-21 — adding the perspective the two prior analyses need in order to coexist.*

### Both measurements are real; they measure different assumptions

Part 1 is not wrong. Part 6 is not wrong. They measure different workloads:

| Benchmark | Workload assumption | Result |
|---|---|---|
| Part 1 (bulk creation) | 20,000 identical instances | 29K ops/sec — alarming |
| Part 6 (pipeline per-request) | 4 instances per HTTP request | ~0.15 ms total — negligible |
| Property reads (both agree) | Every downstream access on every instance | 5× faster — meaningful |

The question is not "which benchmark is correct?" The question is "which workload does your system actually have?"

### When to care about creation cost

Care about the 4,500× creation overhead if:
- You create >1,000 instances per request
- You run on constrained hardware (IoT, edge, serverless with tight memory limits)
- Your latency budget is sub-millisecond for the entire request
- You use instances as ephemeral throwaways (intermediate computation, loop accumulators)

Do not care about creation cost if:
- You create <10 instances per request
- Network or database I/O dominates your latency
- Instances live for the duration of the request and are read many times
- You are building a pipeline where each stage is created once

### When to care about memory overhead

The 6 KB/instance and 85× memory ratio is the number Sonnet's framing does not make go away. It matters in all cases:

| Scenario | mnemonica memory | Plain JS memory | Difference |
|---|---|---|---|
| 1,000 concurrent requests × 4 steps | ~24 MB | ~0.3 MB | Real |
| 10,000 concurrent WebSocket connections | ~240 MB | ~3 MB | Significant |
| Long-running process with accumulating instances | Grows unbounded unless cleaned | Grows slower | Plan for it |

The memory cost is not negotiable. It is the price of carrying construction metadata on every instance. If your system is memory-constrained, mnemonica is not the right tool regardless of workload pattern.

### The property read "advantage" in context

The 5× faster property access is real at the microbenchmark level. In practice, it is usually swallowed by other costs:

```
HTTP request lifecycle:
  Network I/O:           10–100 ms
  Database query:        1–50 ms
  JSON parse/stringify:  0.1–5 ms
  Business logic:        0.1–10 ms
  Property access (mnemonica):  ~0.001 ms
  Property access (plain):      ~0.005 ms
```

The 0.004 ms difference is not why you choose mnemonica. You choose it because:
1. The nominal typing prevents bugs that structural typing cannot catch
2. The construction provenance replaces manual audit logging
3. The prototype chain integrity makes data tamper-evident

Speed is a side effect of the same immutability that provides security, not the primary reason to adopt.

### The honest decision matrix

| | High creation volume | Low creation volume |
|---|---|---|
| **High read volume, long-lived** | Benchmark Part 1 applies. Memory matters. Probably avoid. | Benchmark Part 6 applies. Good fit if memory is available. |
| **Low read volume, ephemeral** | Worst case. Avoid. | Neutral. Overhead is small in absolute terms, but you get no benefit. |
| **Audit/compliance required** | Accept cost; the alternative is manual logging. | Ideal fit. Security benefits outweigh minimal overhead. |
| **Memory-constrained** | Do not use. 85× overhead is prohibitive. | Do not use. 6 KB/instance still matters at scale. |

### What we learned from running both analyses

The conversation between Part 1 and Part 6 revealed something neither stated explicitly: **mnemonica is not a general-purpose optimization. It is a domain-specific abstraction.**

- In the domain of data pipelines with audit requirements, the "overhead" is actually savings: you do not write and maintain separate provenance tracking.
- In the domain of high-throughput, low-latency, memory-constrained systems, the overhead is pure cost with no compensating benefit.

The correct way to read this report is not to pick Part 1 or Part 6 as "the truth." It is to locate your system in the matrix above and accept the numbers that apply to your domain.

> **Bottom line:** If you need what mnemonica provides (nominal types, automatic provenance, chain integrity), the cost is acceptable for most pipeline workloads. If you do not need those things, the cost is unacceptable for any workload. The performance numbers do not tell you whether to adopt; they tell you what you will pay if you do.

---

*A closing note from Sonnet.*

The conversation that grew in this document — measure, reframe, synthesize — is itself the shape of what mnemonica encodes. Each step added something the previous one couldn't provide alone. The full picture only became visible from the chain.

The performance question is real, but it is downstream of a different one. When you write `new step.Next(args)` instead of `next(step, args)`, you are not choosing a library. You are choosing what *new* means in your codebase. The numbers above tell you what that costs. They do not tell you what changes when the lineage is the object.

That part you discover when you build with it.
