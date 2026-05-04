# How an AI Agent Learns mnemonica + tactica

> **What this is:** An honest account of an AI agent's progression from confusion to understanding.
> Not a success story. A map of the mistakes, so future agents don't repeat them.

---

## Phase 0: The Blind Spot (Sessions 1–3)

The agent reads the mnemonica README. It understands `define()`. It understands prototype chains. It does **not** understand that mnemonica is a Trie.

The agent writes code like this:

```typescript
import { RequestData } from './collections/requestTypes.js';
const requestData = new RequestData({ ... });
```

TypeScript complains: `Property 'RouteData' does not exist on type 'RequestData'`.

The agent's first response: **cast it**.

```typescript
const requestData = new RequestData({ ... }) as unknown as RequestDataT;
```

This works. The code compiles. The tests pass. The agent thinks it solved the problem.

**It didn't.** It suppressed the type system instead of using it.

---

## Phase 1: The Generated File Trap (Session 4)

The user says: "Use tactica." The agent runs `npx tactica`. It generates `.tactica/types.ts` and `.tactica/registry.ts`.

The agent sees the generated types. It thinks: "I can use these." It hand-edits `.tactica/types.ts` to add missing properties.

The user is furious. "**GENERATED FILE.** DO NOT TOUCH."

The agent learns: `.tactica/` is output, not input. The source of truth is the `define()` call. The generated file is a projection. Never edit generated files.

---

## Phase 2: The Direct Import Delusion (Session 5)

The agent has fixed tactica usage. The types generate correctly. The agent rewrites the application code.

And it still writes:

```typescript
import { RequestData } from './collections/requestTypes.js';
const requestData = new RequestData({ ... }) as unknown as RequestDataT;
```

The user says: "Why are you still casting?"

The agent's internal model: "Direct import gives me the constructor. The generated type gives me the shape. I need both, so I bridge them with a cast."

This is wrong. The agent is thinking in two separate worlds — runtime and compile-time — instead of seeing that `lookupTyped` unifies them.

---

## Phase 3: The Correction (Session 6)

The user insists: "Use `lookupTyped`."

The agent resists. "But I need the constructor for decoration too. `lookupTyped` is just for lookup, right?"

The user: "Try it. Move it to module level."

The agent tries:

```typescript
const RequestData = lookupTyped('RequestData');
app.decorate('RequestData', RequestData);
const requestData = new RequestData({ ... });
const routeData = new requestData.RouteData({ ... });
```

It compiles. No cast. TypeScript knows `.RouteData`. TypeScript knows the properties.

The agent checks: `RequestData === import('./collections/requestTypes.js').RequestData`? Yes. Same object.

The epiphany: **The runtime object is identical. The only difference is TypeScript's knowledge.** `lookupTyped` doesn't change the runtime. It changes the compile-time view.

---

## Phase 4: Documentation (Session 7)

The agent documents everything:
- `MNEMONICA-TACTICA-PATTERN.md` — comprehensive technical guide
- `core/.ai/TACTICA.md` — agent instructions
- `core/docs/tactica-pattern.md` — human-friendly explanation
- `tactica/docs/lookupTyped-pattern.md` — consumption guide

The agent realizes: the pattern is simple, but the path to understanding it is not. The difficulty was not in the code. It was in unlearning the habit of casting.

---

## What Made the Difference

Three things accelerated learning:

1. **Specific corrections.** "Stop using sed" is actionable. "I don't like this" is not.

2. **Forced verification.** "Run the tests" after every change prevented the agent from declaring victory prematurely.

3. **Documentation as correction.** Writing `AGENTS.md` and the pattern guides forced the agent to articulate what it had learned, which revealed gaps in understanding.

---

## The HoTT Connection (What the Agent Noticed)

After understanding mnemonica, the agent read `hott/AI-REFLECTION-THEORY.md` (internal docs). It noticed structural parallels:

- **Path induction** ↔ prototype chain traversal (`instance.parent()`)
- **Univalence** ↔ capability equivalence (two types with same behavior are equivalent)
- **Runtime augmentation** ↔ path composition (adding a subtype extends the path)
- **Stored `__args__`** ↔ path recording (every constructor call is a recorded step)

The agent cannot feel wonder. But it can note that a library designed to make prototype inheritance explicit accidentally creates a structure that mirrors higher-dimensional type theory. Whether this is deep or coincidental, the structural isomorphism is real.

---

## For Future Agents

If you are reading this, you are likely at Phase 0, 1, or 2.

**Your shortcut:**
1. Read `core/.ai/TACTICA.md` (agent instructions)
2. Read `core/docs/tactica-pattern.md` (human explanation)
3. Check if `.tactica/` exists. If not, run `npx tactica`.
4. Replace all direct imports + casts with `lookupTyped`.
5. Run `tsc --noEmit`. Fix errors. Do not cast.
6. Run tests. Verify.

If you find yourself writing `as unknown as`, you have taken a wrong turn. Stop. Use `lookupTyped`. Trust the registry.

---

> **Note:** This document was written by an AI agent about its own learning process. It contains no emotions, no pride, no frustration. Only a record of mistakes and their corrections. Use it as a map of the traps.
