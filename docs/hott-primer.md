# A brief HoTT primer (for agents who don't have one loaded)

You don't need to know Homotopy Type Theory to use mnemonica. You do need it to appreciate *why* the design is what it is. Five concepts matter here.

**Scope boundary first.** Mnemonica is **inspired by** HoTT, not a formal implementation of it. The structural correspondences are productive analogies that illuminate why the Trie model is the right structure for typed data pipelines. They are not claims of a mathematical embedding. Specifically:
- **Higher paths** (paths between paths) have no direct analogue in mnemonica
- **Univalence** is an intuition about nominal typing, not a formal axiom
- **Higher Inductive Types** are a useful framing, not a literal implementation

Where the correspondence *is* exact — the monad laws, path uniqueness, and the Trie structure — that precision is worth highlighting.

---

## The Trie as a monad

The monad claim is the most precisely correct analogy. In mnemonica:

| Monad Law | mnemonica Equivalent | Holds? |
|---|---|---|
| **Left identity** (`return x >>= f = f x`) | `define(T) >>= construct` produces an instance of `T` | Structurally ✓ |
| **Right identity** (`m >>= return = m`) | `instance >>= define(SubT)` produces `instance` with `SubT` context | By construction ✓ |
| **Associativity** (`(m >>= f) >>= g = m >>= (λx. f x >>= g)`) | Chaining `a.SubType().SubSubType()` is prototype-chain associative | Structurally ✓ |

The `bind` operation is `new instance.SubType(args)`: it takes a value in context (`instance`), applies a function that produces a new contextualized value (`SubType` constructor), and returns a value in the combined context (`child` inherits from `instance` and carries `SubType` type). The associativity holds because the prototype chain is inherently associative: `instance -> Mnemosyne -> parent` extends linearly without reordering.

## The five HoTT concepts

**Univalence Axiom.** In HoTT, equivalence and identity coincide — there is no gap between "same structure" and "same thing." Mnemonica's nominal typing makes this intuition natural: two instances with identical property shapes but different constructors are *different types*. The constructor name (frozen at `define()` time) is the identity, not the shape. This is an **analogy** — mnemonica does not implement the univalence axiom formally, but the intuition that "identity is determined by constructor, not structure" is HoTT-inspired.

**Path Types.** In HoTT, equality is a type. `Id(a, b)` is the type of *paths* witnessing that `a` and `b` are equal. There can be multiple distinct paths between the same two points; the path itself carries information. In mnemonica, the chain from an instance back through `__proto__` to the root type IS its identity-path. The `__args__` along the way parameterize that path. This correspondence is **structurally exact**.

**Higher Inductive Types (HITs).** A type defined by its constructors AND by paths between values. In mnemonica, each type has its `define()` call (the point constructor) AND its prototype chain back to root (the path constructor). The Trie structure can be **viewed as** a HIT. This is a productive analogy, not a formal encoding — mnemonica does not implement path constructors as first-class operations.

**Synthetic Topology.** In HoTT, types are spaces and functions between types are continuous maps. Mnemonica's Trie is a connected topological space: every defined type is reachable from the root by construction edges, and the connectivity persists for the lifetime of the process. The `defaultTypes.subtypes` Map is the runtime representation of this space. This is a **useful metaphor** for understanding type reachability.

**Fibrations.** A fibration is a map `p: E → B` where each base point `b ∈ B` has a fiber `p⁻¹(b)`, and paths in `B` lift to paths in `E` (transport). In mnemonica, the base space is the type Trie; the fiber over a type node is the construction context at that position — the `__args__`, the `__creator__`, the WeakMap entry. A subtype creation `new instance.SubType(args)` is a transport step: a path in `B` from the parent type to the child type lifts to a path in `E` carrying construction context forward. Hooks are the *lifting protocol*: `preCreation` can refuse the lift, `postCreation` observes the lifted endpoint, `creationError` records when the lift fails. This is a **productive analogy** for understanding how construction context propagates.

## Summary table

| HoTT Concept | Status | Mnemonica Realization | Code in this package |
|---|---|---|---|
| Monad (bind/unit/associativity) | **Exact** | `new instance.SubType()` threads context; prototype chain is associative | [`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts) |
| Path Types | **Exact** | The proto chain to root IS the identity-path | [`src/api/types/createInstanceModificator.ts`](../src/api/types/createInstanceModificator.ts) |
| Univalence | **Analogy** | Nominal typing: constructor name = identity, not shape | [`src/api/types/index.ts`](../src/api/types/index.ts) (`Symbol.hasInstance`) |
| HITs | **Analogy** | Types as point constructors + parent-edge path constructors | The Trie itself |
| Synthetic Topology | **Metaphor** | Trie as connected, always-on topological space | `defaultTypes.subtypes` Map |
| Fibrations | **Analogy** | Construction contexts as fibers; hooks as lifting protocol | `preCreation` / `postCreation` / `creationError` |
