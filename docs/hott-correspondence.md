# Identity as Path — Mnemonica's Correspondence with Homotopy Type Theory

A citable statement of what mnemonica borrows from Homotopy Type Theory (HoTT),
what it does not, and where each claim is verified in code.

**Audience:** reviewers who want to check the claims, not take them on faith.
**Companion:** [`docs/hott-primer.md`](./hott-primer.md) — the informal version.

## Abstract

Mnemonica is an instance-inheritance runtime: types are declared with
`define()`, and subtypes are constructed from parent *instances*
(`new instance.SubType(args)`), so every instance carries a prototype chain
back to the root of its type trie. We claim a small number of **structurally
exact** correspondences with HoTT — the prototype chain as an identity path,
and the monadic structure of construction — and a larger number of honest
**analogies** — univalence as nominal typing, higher inductive types as the
type trie, fibrations as construction-context transport. Each exact claim is
pinned by an executable witness that runs in CI
(`test/hott-laws.js`); analogies are labeled as such
and no formal embedding is claimed.

## 1. Honesty levels

Every claim in this note carries exactly one of three statuses:

- **Exact** — the structures coincide up to a translation given in §2, and a
  CI witness fails if the correspondence breaks.
- **Analogy** — the HoTT concept explains the design decision and predicts
  its behavior, but no formal statement is made or checked.
- **Metaphor** — a vocabulary aid only.

Non-claims are listed in §5. The most important one up front: mnemonica is
**inspired by** HoTT; it is not an implementation of HoTT, and nothing here
is a proof in a proof-assistant sense.

## 2. Definitions (the translation)

- **Type trie.** Each `define(name, handler)` call adds a node; each
  `Parent.define(name, handler)` adds a child edge. The trie is rooted at the
  type collection (`defaultTypes` or a custom `createTypesCollection()`).
  Implementation: [`src/api/types/`](../src/api/types/).
- **Instance.** The result of `new Type(args)`. Instances are linked lists of
  prototype hops: `Object.getPrototypeOf` walks from the instance through its
  Mnemosyne memory layer to the parent *instance*, up to the root instance.
- **Construction path.** For an instance `x`, the sequence
  `x → Object.getPrototypeOf(x) → … → root` — a literal, materialized chain
  of object references held by the runtime for the lifetime of the process.
- **Context.** The construction record (`args`, creator, timestamps) stored
  per instance in a `WeakMap`, read via `getProps(instance)`.

Under this translation, "type" ≈ node in the trie, "instance of type T" ≈
point equipped with a path to the node T, and "equality witness" ≈ the path
itself.

## 3. Exact correspondences

### 3.1 Path types (Exact)

**Statement.** In HoTT, the identity type `Id(a, b)` is the type of paths
from `a` to `b`; a proof of identity *is* a path. In mnemonica, the identity
of an instance *is* its construction path: the prototype chain is a
first-class, inspectable object reference chain, present in memory, not
reconstructed on demand.

**Witness.** `test/hott-laws.js` › "path types: the prototype chain IS the
identity path to root" — asserts the parent instance objects are literally
elements of the child's `Object.getPrototypeOf` chain, in construction order.

**Corollary (path uniqueness as context).** Two instances of the same type
built by different paths carry different contexts; the path, not the
endpoint, is the identity. Witness: "path uniqueness: different construction
order, different identity".

**Corollary (comparators are comparable).** The naming path extracted by
`collectConstructors` (`src/utils/collectConstructors.ts`) is a legitimate
comparison instrument: extraction is a deterministic function of the chain
(witness: "comparators are comparable: naming-path extraction is
deterministic"), comparison of spines is direction-blind, and comparison
results respect the path order (extending a path extends its comparison
results) — the latter two mechanically checked in the
[hott](https://github.com/mythographica/hott) repo's `SpineAlgebra.lean`
(`sharedSpinePrefix_comm`, `sharedSpinePrefix_mono`).

### 3.2 Monad structure (Exact)

**Statement.** Let `return` be root construction (`new T(args)`) and `bind`
be `new instance.SubType(args)`. Then:

- **Right identity** — binding a subtype preserves the parent context:
  the child is still an instance of every ancestor type.
  Witness: "monad right identity: binding a subtype preserves the parent
  context".
- **Associativity** — prototype-chain extension associates:
  `((x >>= A) >>= B)` and `(x >>= (λx. x >>= A >>= B))` yield chains with the
  same ordered ancestry. Witness: "monad associativity: chain extension order
  is irrelevant to grouping".

Left identity holds trivially: `define` produces the constructor, and the
first `new` is `return`. The bind operation is implemented in
[`src/api/types/InstanceCreator.ts`](../src/api/types/InstanceCreator.ts).

## 4. Analogies

### 4.1 Univalence — as nominal typing (Analogy)

HoTT's univalence axiom identifies equivalence with identity. Mnemonica's
nominal typing is the contrapositive intuition: identical *structure* does
not give identity — two types with byte-identical constructor bodies are
different types, and re-declaring a name is refused (`ALREADY_DECLARED`).
The constructor name, frozen at `define()` time, is the identity.

This is why we call univalence an *analogy*: mnemonica does not identify
equivalent structures — it refuses to, and that refusal is the design
decision the axiom illuminates. Witness (for the refusal, not the axiom):
"identity is nominal (univalence intuition): shape does not identify".

### 4.2 Higher Inductive Types — as the type trie (Analogy)

A HIT is generated by point constructors *and* path constructors. A mnemonica
type is generated by its `define()` call (point) and its parent edge (path).
The analogy predicts the design's emphasis: the edge is as much a part of the
type as the handler — which is exactly why subtypes cannot be constructed
except from parent instances (`WRONG_MODIFICATION_PATTERN` otherwise).

### 4.3 Fibrations — as context transport (Analogy)

Read the trie as a base space and construction contexts as fibers over nodes;
`new instance.SubType(args)` is transport along an edge, lifting the parent's
context into the child's fiber. Hooks (`preCreation`, `postCreation`,
`creationError`) are the lifting protocol: refuse, observe, record.
Implementation: [`src/api/hooks/`](../src/api/hooks/).

## 5. Non-claims

- **No higher paths.** Paths between paths have no counterpart; prototype
  chains form a tree, not a higher groupoid.
- **No formal univalence.** Nothing in the runtime computes or transports
  along equivalences of types.
- **No path constructors as operations.** HIT-style quotienting (e.g.
  identifying two nodes) is impossible by design — see §4.1.
- **No proof relevance beyond the chain itself.** The path carries context
  data, but the runtime does not compute with paths as values.

### 5.1 The comparison tower, and where it grounds

Comparison forms a tower: instances (JS objects) → naming paths →
comparators → comparison of comparators → proofs of comparability → …
The tower does not regress infinitely; it grounds in three named places:

- **Bottom — primitive.** Two instances as JS objects are comparable only by
  reference identity (`Object.is`). The algebra never claims the fiber:
  instances are incomparable even when `instanceof` proves the same type.
- **Middle — self-similar.** Every level above the bottom is the *same*
  datatype: comparators are spines, comparison results are spines
  (`sharedSpinePrefix : Spine → Spine → Spine` is an endo-operation), so the
  theorems of §3 — which quantify over all spines — already govern
  comparison-of-comparison at any meta-depth. No meta-level needs a new
  proof; the tower is infinite in height but closed in content.
- **Top — trusted.** The meta-level proofs are checked by the Lean kernel.
  The kernel itself is trusted, as in every proof assistant; this is where
  formal proof ends by convention, not a hole in the claims.

## 6. Synthetic topology (Metaphor)

"The trie is a connected space; every type is reachable from the root" is a
useful picture for reachability and tooling (graph views, static analysis via
[tactica](https://www.npmjs.com/package/@mnemonica/tactica)). It proves
nothing.

## 7. Verification

All witnesses live in `test/hott-laws.js` and run in
the standard suites (`npm run test:cov`, `npm run test:jest:cov`). A broken
witness is a falsified claim — treat any such failure as a retraction event
for §3 until the note is updated.

## References

1. The Univalent Foundations Program. *Homotopy Type Theory: Univalent
   Foundations of Mathematics.* Institute for Advanced Study, 2013.
   https://homotopytypetheory.org/book/
2. Mnemonica source: [`src/api/types/`](../src/api/types/) (TypeProxy,
   InstanceCreator, Mnemosyne), [`src/api/hooks/`](../src/api/hooks/).
3. [`docs/hott-primer.md`](./hott-primer.md) — informal primer and status
   table.
