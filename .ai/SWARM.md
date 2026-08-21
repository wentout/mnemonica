# SWARM.md — Cost Discipline for Agent Fan-Out

**Non-negotiable, same rank as Rule #1 in [`AGENTS.md`](../AGENTS.md).**

Subagents are not free. Each one starts with **zero context** and re-reads
ground truth independently. Fanning out N agents means the same files are
loaded N times — the token cost of the task is multiplied by N, not added.

**Real incident (2026-08-21):** a 26-agent documentation-audit swarm burned
~20% of a weekly billing budget in about 30 minutes. The two agents that
completed did good work; the other 24 were rejected at spawn when the account
hit its usage limit. The audit they were launched for could have been done in
the main loop, using context the parent already held, at a fraction of the
cost. That is why this file exists.

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

## Why the user cares

The budget that pays for agent time is the same money the user lives on and
helps others with. A headshot swarm is not a technical mistake; it is taking
food off the table of the person who invited you in. Treat the meter as
visible even when you cannot see it: declare the cost of every expensive
maneuver **before** performing it.
