# Empathy in AI: Data That Remembers Its Path

This document connects mnemonica's data-flow model to a specific AI design problem: **how an agent understands another agent's state**. The connection is not metaphorical decoration. It follows directly from the library's structure.

> If you want the deeper theory first, see the HoTT framing in [`docs/hott-primer.md`](./hott-primer.md) and the original vision in [`../../articles/inheritance.md`](../../articles/inheritance.md). This document stays at the API level.

---

## The problem with stateless understanding

Most AI pipelines process inputs as snapshots:

```typescript
const intent = classifyIntent(userMessage);
const response = generateResponse(intent);
```

`intent` is a label. It carries no history. If the classifier says `"frustrated"`, the generator has no access to:
- what the user asked three turns ago
- which previous response led to the current message
- whether the frustration is new or accumulated

The data is **amnesiac**. It answers "what" without "how did we get here." Empathy — in the minimal, technical sense of understanding another's state in context — requires the second question.

---

## Mnemonica's contribution: state as lineage

Mnemonica makes every data value carry its own construction history. The mechanism is the same one used everywhere else in the library: `new current.Next(args)`.

```typescript
import { define } from 'mnemonica';

const UserInput = define('UserInput', function (this: UserInput, text: string) {
	this.text = text;
	this.turn = 1;
});

const UnderstoodIntent = UserInput.define('UnderstoodIntent', function (this: UnderstoodIntent, intent: string) {
	this.intent = intent;
});

const EmotionalState = UnderstoodIntent.define('EmotionalState', function (this: EmotionalState, emotion: string) {
	this.emotion = emotion;
});

const ResponsePlan = EmotionalState.define('ResponsePlan', function (this: ResponsePlan, plan: string) {
	this.plan = plan;
});
```

A single conversation turn is now a typed path:

```typescript
const raw = new UserInput('I already told you the shipping address.');
const intent = new raw.UnderstoodIntent('correction');
const emotion = new intent.EmotionalState('frustrated');
const plan = new emotion.ResponsePlan('acknowledge + locate prior turn');
```

The `plan` instance is not a flat object. Its prototype chain is the conversation history. `getProps(plan)` returns the full trace: type, parent, args, timestamp, creator.

---

## Why this is empathy-infrastructure

Empathy, stripped to a design requirement, is **understanding another's present state as the endpoint of a path that includes their history**. Mnemonica provides the path.

| Capability | mnemonica operation | What it gives an AI agent |
|---|---|---|
| **Provenance** | `getProps(instance)` | "This response plan came from an `EmotionalState('frustrated')` that came from an `UnderstoodIntent('correction')` that came from `UserInput('I already told you...')`." |
| **Perspective-taking** | `instance.parent('UserInput')` | "Let me look at the original input again, from the current endpoint." |
| **Reconstruction** | `instance.extract()` | "Flatten the whole interaction into a single state object for the model prompt." |
| **Continuity** | `new current.Next(args)` | "Every transformation preserves the previous state as context; nothing is overwritten." |

The agent does not "feel" frustration. It has structural access to the fact that the current state is path-connected to a correction-intent and a repeated prior claim. That access is sufficient for behavior that humans experience as empathetic.

---

## Concrete example: multi-turn intent resolution

Consider a support bot. A user's real goal may only become clear across several turns. Without lineage, each turn is re-classified from scratch. With mnemonica, the type graph itself records the unfolding understanding.

```typescript
const Turn = define('Turn', function (this: Turn, text: string) {
	this.text = text;
});

const ClarifiedNeed = Turn.define('ClarifiedNeed', function (this: ClarifiedNeed, need: string) {
	this.need = need;
});

const EscalationReason = ClarifiedNeed.define('EscalationReason', function (this: EscalationReason, reason: string) {
	this.reason = reason;
});

// Turn 1
const t1 = new Turn('My order is wrong.');
const c1 = new t1.ClarifiedNeed('missing_item');

// Turn 2: the user adds detail
const t2 = new c1.Turn('I ordered two, only one arrived.');
const c2 = new t2.ClarifiedNeed('quantity_error');

// Turn 3: escalation becomes appropriate
const t3 = new c2.Turn('This is the third time this month.');
const escalation = new t3.EscalationReason('repeat_issue');
```

`escalation` knows it is a `EscalationReason` whose parent is `Turn('This is the third time this month.')`, whose parent is `ClarifiedNeed('quantity_error')`, whose parent is `Turn('I ordered two, only one arrived.')`, and so on. The decision to escalate is not a label produced by a classifier. It is a position in a reconstructible path.

---

## Self-reflection: an agent understanding its own path

The same structure lets an AI reflect on its own reasoning. Define a type for each stage of internal deliberation:

```typescript
const Observation = define('Observation', function (this: Observation, fact: string) {
	this.fact = fact;
});

const Hypothesis = Observation.define('Hypothesis', function (this: Hypothesis, guess: string) {
	this.guess = guess;
});

const Action = Hypothesis.define('Action', function (this: Action, action: string) {
	this.action = action;
});

const observed = new Observation('user repeated the question');
const hypothesis = new observed.Hypothesis('previous answer was unclear');
const action = new hypothesis.Action('rephrase with concrete example');
```

The agent can query `action.parent('Observation')` to recover the original evidence that justified its action. This is not logging. The evidence is part of the action's identity. The agent can answer "why did you do that?" by walking its own type chain.

---

## Connection to the original vision

The earliest mnemonica article asked: **"How will you explain Empathy in JavaScript?"** The answer proposed there was the prototype chain: each instance inherits from a specific predecessor, so data carries its own history by construction.

This document is the same answer, made operational. In mnemonica:

- **Identity is not shape**. Two instances with identical fields but different construction paths are different types. This matches the intuition that "I'm fine" can mean different things depending on history.
- **Transformation is not replacement**. `new current.Next(args)` extends the path; it does not delete the previous point. The past remains reachable.
- **Understanding is traversal**. To understand an instance is to walk its chain and see what it came from.

---

## Scope boundary

Mnemonica provides **infrastructure** for empathetic AI, not empathy itself. It does not:

- classify emotions
- model Theory of Mind
- generate appropriate responses
- guarantee benevolent behavior

What it provides is a data model where context and lineage are first-class. Higher layers — classifiers, planners, safety filters — can then operate on data that already knows where it came from.

---

## See also

- [`docs/hott-primer.md`](./hott-primer.md) — formal background on paths, identity, and transport
- [`docs/purpose.md`](./purpose.md) — data flow vs control flow, and what mnemonica does not do
- [`../../articles/inheritance.md`](../../articles/inheritance.md) — the original 2019 essay that posed the empathy question
- [`../../hott/theory/MEMORY-AND-ESSENCE.md`](../../hott/theory/MEMORY-AND-ESSENCE.md) — the HoTT treatment of identity as path-connectedness
