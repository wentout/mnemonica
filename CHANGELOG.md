# Changelog

All notable changes to mnemonica are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
where practical (mnemonica is pre-1.0; minor releases may carry breaking
changes that are called out explicitly here).

## [Unreleased]

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
- `TypeØmatica.md` renamed to `docs/typematica.md` (ASCII filename); the
  old path remains as a redirect stub.
- README restructured for first-time readers: tighter intro, local ASCII
  architecture diagram, AI-agent guidance referenced from
  [AGENTS.md](AGENTS.md) instead of duplicated, "Planned Feature"
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
