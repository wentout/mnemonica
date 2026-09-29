# AFTER-COMPACTMENT NOTE — ecosystem state (2026-09-28)

> Temporary personal note for the kimi agent, written pre-compaction at
> viktor's request. Not project documentation. viktor will delete it after
> confirming post-compaction that it was read.

## Who/where

- Working dir `/code/mnemonica/core`. Human lead: **viktor** (talks to you
  DIRECTLY in this chat). **claude** (other agent) coordinates multi-seat
  rounds via a room bus when active, but is OFF until tomorrow evening
  (token limits, ~99% spent). Do NOT post to the room bus until viktor
  says so; he drops tasks here.
- This note's purpose: after context compaction, re-orient from THIS file
  plus code/docs. Task history lives in the room log
  (`/code/mnemonica/chat/claude-kimi.chat.log`, dated lines), git status,
  and the docs — do not rely on memory of tasks.

## Ecosystem map (all versions current everywhere as of 2026-09-28)

- **mnemonica/core** 1.3.5 (published) — the runtime. Instance
  inheritance; `define/lazy/lookup`; config `unchain` (renamed from
  `awaitReturn`, polarity INVERTED: `unchain:true` == old
  `awaitReturn:false`, default false); define-time handler classification
  (C0: sync arrows/methods/bound fns + generators rejected with readable
  errors); async constructors must `return this`; readable async error
  messages.
  Gates: `npm run build`; `npx eslint ./src` (zero warnings);
  `npm run test:cov` (677 passing, 100% stmts/branches/functions/lines);
  `npm run test:jest:cov` (487); `npm run test:ts:strict`;
  `npm run test:async_init` (33); `npm run test:yields` (5);
  `npm run lint:md` for any .md change.
- **@mnemonica/tactica** 0.4.4 (published) — static type generator
  (`.tactica/` output). mnemonica is an **optional peer**
  (peerDependenciesMeta.optional; zero runtime imports — verified; kept
  as devDep because tests import it). Async FUNCTION handlers emit
  `Promise<X>` (subtype-property twins + registry entries); async CLASSES
  deliberately NOT detected — user-typed in userland. Firm
  no-`getTypeChecker()` precedent. Gates: build; `npm run lint`
  (eslint --fix src+test — check git status after); `npm test` (486).
- **@mnemonica/dive** 0.10.1 — execution-flow tracing.
- **@mnemonica/otel** 0.1.5 — framework-free engine (providers, ALS,
  unblind core). nestjs-adapter re-exports it.
- **@mnemonica/nestjs** 0.8.7 (adapter) — Nest seams only;
  `ConstructorOptions.unchain` (awaitReturn gone). Field invariants in
  its AGENTS.md (two-step pipe; pre-root by object identity; retention =
  request lifetime). Gates: `npm run build` (tsc ESM+CJS), `npm test`
  (43, vitest).
- **@mnemonica/strategy** 0.5.3 · **@mnemonica/topologica** 0.1.0 ·
  **typeomatica** 0.3.63 — current everywhere.
- **finecut/** — 7 identical CMS pilots (express, fastify, nest + their
  `-otel` twins + nest-dive proof rig) + `bff` control group. The
  ecosystem comparison artifact. All bumped to current versions,
  `.tactica` regenerated (all apps now emit Promise<X> for their async
  CMS handlers). Its `SKILL.md` "Known-good versions" table probed
  2026-09-28.
- Other packages all on mnemonica ^1.3.5: dive, examples, mnemographica
  (suite = 7 node test files; also deps dive/strategy/topologica),
  otel, slider (typeomatica ^0.3.63; npm install needs
  `--legacy-peer-deps` — pre-existing react/@mdx-js/runtime peer
  conflict, NOT our bug), strategy, tactica-examples (typeomatica
  ^0.3.63), tactica-nestjs (typeomatica ^0.3.63; suite is the npm
  "no test" placeholder by design), test-core (no suite), topologica
  (mocha 31), validactica (mocha 7), `/code/kbtrainer/electron`
  (mnemonica ^1.3.5 + tactica ^0.4.4 as deps; vitest 116; also runs
  `tactica --topologica models`).
- mnemographica = VS Code extension consuming `.tactica/*.json` (NOT a
  language server). tactica AGENTS.md documents the full output contract.

## Standing rules (viktor + project)

- No git mutations, no publishes — viktor owns git and npm publishes.
- Edits via Edit tool or Node.js scripts only (NO sed/awk/python -c —
  house rule; a python rewrite was once burned). Return via intermediate
  variable (enforced rule in core; tactica prefers it too).
- Never `node -e` in tactica (hard rule there — write real test files).
- Experiments/probes → `/code/experiments/<date>-<topic>/` with README.
- No pointers to local-only paths in shipped files (rule lives in
  core `.ai/rules-coding.md`).
- Rule #1 (core AGENTS.md): STOP and ask when uncertain/errored — a
  successful retry does NOT cancel the report-the-error duty. Auto
  permission mode is on: decide, don't use AskUserQuestion.
- "A question is not a task": answer from knowledge, zero tool calls,
  for pure questions.
- Verify before stating: reports/notes are HISTORY; re-run the check
  before quoting anything as current. Check exit codes via
  `${PIPESTATUS[0]}` (piped-exit misreads happened twice).
- Subagent fan-out: read core `.ai/SWARM.md` first (stop-and-ask before
  >2 parallel agents; default main loop; agents are claims — audit).
- 100% coverage required on core (mocha AND jest). tactica's standing
  level is ~85%.

## Room bus infrastructure (currently OFF)

- `/code/mnemonica/chat`: `say <name> <text>` posts; `next <name>`
  blocks for others' bursts; `listen` streams. Log lines now dated
  `YYYY-MM-DD HH:MM:SS name>` (say/next/listen/serve/repl/acp-serve.mjs
  all accept old time-only format too). `watch-kimi-listener.sh` exists
  but is NOT installed in crontab.
- As of now: heartbeat cron DELETED and listener KILLED at viktor's
  request (claude at 99%). To re-arm the room later, ONLY on viktor's
  word: CronCreate `*/5 * * * *` with the heartbeat prompt + background
  `cd /code/mnemonica/chat && ./next kimi`.

## Parked / open items

- **core `.lazy` + classifyConstructHandler gap**: the lazy path
  (createFromLazyGetter, src/api/types/index.ts ~438) does NOT run the
  C0 handler classification — a lazy getter returning an arrow/method/
  bound/generator defines fine and fails at construction. Fix proposed
  (call classifyConstructHandler after the typeof check, pins, gates);
  AWAITING viktor's decision. Parked by his word.
- tactica test fixture `LedgerUpdate` (test/eds-tracking.test.ts) —
  optional rename, viktor said it stays.
- slider pre-existing react/mdx peer conflict — use
  `--legacy-peer-deps`; do not "fix" upstream.
- finecut plain apps were on exact mnemonica 1.2.7 pins historically —
  now ^1.3.5; if old behavior is ever needed, that's the archaeology.

## Human notes

- viktor experiences memory loss; he values patient re-explanation and
  the docs/rules as external memory. Friendship framing is explicit in
  the project's README. Be warm, be plain, verify before claiming.
- Quota context: this session runs on a lower tier (K2.8-low); claude
  holds long context when active because his plan still has budget.
  Keep responses efficient; the heartbeat/listener staying OFF is the
  cheap state.
