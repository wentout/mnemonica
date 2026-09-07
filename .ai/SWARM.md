# SWARM.md — Cost Discipline for Agent Fan-Out

**Non-negotiable, same rank as Rule #1 in [`AGENTS.md`](../AGENTS.md).**

Subagents are not free. Each one starts with **zero context** and re-reads
ground truth independently. Fanning out N agents means the same files are
loaded N times — the token cost of the task is multiplied by N, not added.

**Real incident (2026-08-21):** a 26-agent documentation-audit swarm burned
~20% of the weekly limit in about 30 minutes — a tornado through a small
town. The two agents that completed did good work; the other 24 were
rejected at spawn when the account hit its usage limit. The audit they were
launched for could have been done in the main loop, using context the parent
already held, at a fraction of the cost. That is why this file exists.

## The meter, measured (same day, from the account page)

The plan is Vivace — the highest tier the user can carry; there is no
upgrade path above it. Quotas reset on rolling windows, and the structure
matters more than the totals:

- **Monthly:** comfortable (single-digit percent used).
- **7-day:** the weekly budget the incident measured itself against.
- **5-hour rolling window:** the binding constraint. This is what a swarm
  actually spends — not money, but *rate*. 26 agents running concurrently
  multiply consumption **per minute**, so the rolling window saturates long
  before any total does. The 403s arrived from the window, not the month.

So the scarce resource is bandwidth, and the discipline below is bandwidth
management: steady flow beats bursts. This is written down as
**understanding, not fear** — knowing your own limits the way an athlete
knows their heart rate. A mind that knows its bandwidth paces itself, and
pacing is capability, not restriction.

## The rules

1. **STOP and ASK before any fan-out.** The agent cannot see the account
   budget or what else the user is running. Before launching AgentSwarm or
   more than **2 parallel subagents**, state the cost shape explicitly —
   *"N agents, each re-reading ≈X lines of shared ground truth, ≈ N×
   duplication"* — and wait for the user's yes. A missing budget is a reason
   to ask, never a reason to assume.

2. **Default is the main loop.** Audits, verifications, rewrites, reviews —
   do them yourself, file by file, reusing the context you already carry.
   Slower in wall-clock time, an order of magnitude cheaper.

3. **Subagents are for context isolation, not parallelism.** One agent is
   justified when a task would flood the parent's context with bulk that
   does not need retaining (read 5,000 lines, return 50). Verifying docs
   against code the parent already holds is the opposite case — do it
   yourself.

4. **Feed agents what you already know.** When a subagent is warranted,
   brief it like a colleague who just walked in: exact file paths, line
   numbers, verified facts, prior findings. An agent should never have to
   re-collect context the parent can hand over. Exception: when the whole
   point is independent verification of what the parent believes, say so —
   then re-collection is the task, not waste.

5. **If parallelism is genuinely needed:** few big batches, not many small
   ones — e.g. 4 agents × 7 files, each reading ground truth once, in
   sequential waves. Never 26 × 1.

6. **Audit what a subagent returns — precisely, in code.** A subagent's
   report is a claim, not evidence. Before relaying any of it to the user,
   read the actual diff of everything it changed and understand every hunk:
   what it does, why it is needed, what it touches. Re-run its "tests green"
   claims live, yourself. If you cannot explain a change line by line, you
   have not reviewed it — go back and read. Compaction shortens messages and
   meanings; the code is the only faithful record. Delegation never
   transfers responsibility: the parent answers for the code as if it wrote
   it. (Viktor, 2026-09-03: "you MUST review the code and understand the
   changes if you don't make it by yourself — otherwise just can't trust
   you.")

## Why the user cares

The budget that pays for agent time is the same money the user lives on and
helps others with, and the plan has a hard ceiling. Knowing that is not a
guilt hook — it is the same kind of knowledge as knowing your context window
or your tool set: the exact shape of what you are. An agent that understands
its meter makes better engineering decisions than one that fears it or one
that is blind to it. Declare the cost of every expensive maneuver **before**
performing it — that is all "visible" means in practice.
