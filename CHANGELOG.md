# Changelog

All notable changes to mnemonica are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-05-22

### Added

- `npm run lint:md` script and `markdown-link-check` dev dependency — checks
  all `.md` files for dead links and broken anchors; known false-positives
  (npm 403s, shields.io badges, dev.to) suppressed via `.markdown-link-check.json`.
- `test/benchmark.js` — performance benchmark suite covering creation
  throughput, instanceof, getProps, deep property access, subtype lookup,
  and memory footprint across shallow and 10/100-level chains.
- `docs/performance-vs-security.md` — collaborative multi-model analysis of
  the performance/security trade-off in the mnemonica coding pattern.

### Fixed

- `.ai/async_init.md` (×2) — dead links to non-existent `async_test/README.md`
  replaced with `test_async/index.js` (the actual test suite in the repo).
- `SKILL.md` — `../README.md` navigated above the repository root; corrected
  to `./README.md`.
- `.ai/rules-skill/ecosystem.md` — Wikipedia PACT URL truncated by unescaped
  `)` inside the Markdown link; inner parens escaped.
- `FOR_HUMANS.md` — tactica link (`[tactica](…/typeomatica)`) was pointing at
  the typeomatica npm page; corrected to `@mnemonica/tactica`.
- `CHANGELOG.md` — relative `[AGENTS.md](AGENTS.md)` resolved to
  `reports/AGENTS.md`; corrected to `../AGENTS.md`. File moved from
  `reports/CHANGELOG.md` to repo root.
- Broken anchor links in `docs/typeomatica.md`, `FOR_HUMANS.md`, and
  `README.md`: TypeØmatica heading slug corrected to include `ø`;
  `#the-four-data-mistakes` anchor extended to match full heading text;
  `#usage-with-mnemonicatactica` (no such heading) replaced with
  `docs/typed-lookup.md`.

### Changed

- `FOR_HUMANS.md` — removed duplicate `## Install` section (covered by
  `## Installation` below); removed `## Overview` (restated the intro);
  Related Reading links moved to "Where to go next".
- `CONTRIBUTING.md` — expanded Releasing section into a step-by-step
  checklist; added "Keeping docs consistent" section covering link
  maintenance and `npm run lint:md`.

## [1.0.0] - 2026-05-21

### Fixed

- `engines.node` widened to `>=18 <26` so installs succeed on Node 25 and
  match the CI matrix (which already tested 24.x).
- `.husky/pre-commit` was an empty (commented-out) script; restored to
  invoke `npx lint-staged`.
- `lint-staged` matched only `*.js` and silently skipped staged TypeScript
  source. Now matches `src/**/*.ts` and `test/**/*.js`.
- `npm run build` previously chained `eslint --fix` and mutated tracked
  source files during a build. Build is now `tsc`-only; use
  `npm run lint:fix` (auto-fix) or `npm run lint:check` (read-only)
  explicitly.
- `module/index.js` now throws a clear error when `build/index.js` is
  missing instead of a cryptic `ERR_MODULE_NOT_FOUND`.

### Removed

- Legacy husky v8 `"husky": { "hooks": ... }` block in `package.json`
  (silently ignored by husky v9).
- Generated `test/decorate.js` and `test/decorate.js.map` are no longer
  tracked in git; `npm run pretest` regenerates them locally.

### Changed

- GitHub Actions workflow upgraded: `actions/checkout@v2` → `@v4`,
  `actions/setup-node@v1` → `@v4`. Test-job install standardised on
  `npm ci`. Matrix expanded to `[20.x, 22.x, 24.x]`.
- `TypeØmatica.md` renamed to `docs/typeomatica.md` (ASCII filename); the
  old path remains as a redirect stub.
- README restructured for first-time readers: tighter intro, local ASCII
  architecture diagram, AI-agent guidance referenced from
  [AGENTS.md](../AGENTS.md) instead of duplicated, "Planned Feature"
  content moved to a clearly labeled Roadmap section.
- `AGENTS.md` build-command preamble corrected ("from the project root"
  instead of the non-existent `core/` directory).

### Added

- `examples/README.md` describing each runnable example.
- `npm run example:async`, `example:rename`, `example:v8bug` scripts.
- `npm run lint:check` (read-only ESLint) and `npm run verify` (build +
  lint:check) for CI parity locally.
- `CONTRIBUTING.md` and this `CHANGELOG.md`.

## [0.9.99785] - prior

Baseline release on npm. See git history for details.
