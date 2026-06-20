# Contributing to mnemonica

Thanks for your interest in mnemonica. This document covers the local
development loop. Repository conventions and code style live in
[AGENTS.md](AGENTS.md).

## Development environment

- Node.js `>=18 <26` (CI runs 20.x, 22.x, 24.x).
- npm 9+ (ships with recent Node).
- Git with `core.hooksPath = .husky/_` (set automatically by `npm install`
  via the `prepare` script).

## Local setup

```bash
git clone https://github.com/wentout/mnemonica.git
cd mnemonica
npm ci
npm run build
npm run test:cov
npm run test:jest:cov
```

`npm run build` is **idempotent and non-mutating**: it only recompiles
`src/` → `build/`. To run linters with auto-fix, use `npm run lint:fix`.
To run linters in read-only mode (CI parity), use `npm run lint:check`.

### Doc-only changes

If your change touches only Markdown files (no `src/`, `test/`, `test-jest/`,
`test-ts/`, or build config), you can **skip `npm run build` and the test
suites**. Run `npm run lint:md` to catch dead links and broken anchors instead.

## Test frameworks

There are two suites and both must stay green:

| Suite  | Source                | Coverage threshold | Command                  |
|--------|-----------------------|--------------------|--------------------------|
| Mocha  | `test/*.js` (built)   | 100% (nyc)         | `npm run test:cov`       |
| Jest   | `test-jest/*.ts`      | 100% (jest)        | `npm run test:jest:cov`  |

Mocha runs against the `build/` output (Js-as-published). Jest runs
TypeScript directly via `ts-jest`. Treat them as cross-validation, not
duplication: a passing Mocha + failing Jest usually points at a runtime
behavior that the type system tolerates, and vice versa.

## Commit style

Conventional commits are preferred:

```
feat: add lookup overload for nested registry
fix(InstanceCreator): preserve __args__ across async chain
docs: clarify instance method opt-in pattern
chore(ci): bump setup-node to v4
```

The `pre-commit` hook runs `lint-staged`, which auto-fixes ESLint issues
on staged `src/**/*.ts` and `test/**/*.js`.

## Branching

- `master` — published releases.
- `proto` — staging branch for the next release.
- Feature branches branch off `proto` and merge back via PR.

## Working principles

Three guidelines that make contribution safer and reviews faster. They apply
equally to human and AI contributors; AI agents should also read Rule #1 in
[`AGENTS.md`](./AGENTS.md).

### 1. Ask before you assume

If you find yourself filling gaps with "probably", "likely", or
"I think it should work" — stop and ask. A wrong assumption costs more than
the conversation it would have taken to clarify. Do not invent workarounds
to make an error go away; investigate the root cause.

### 2. Test before you refactor

For any non-trivial change, write the test first (or alongside). Five minutes
adding a test saves hours of debugging. If a function is hard to test, the
design is the bug — split it. Both test runners (Mocha + Jest) must stay
green and at 100% coverage.

### 3. Plan in small steps

Avoid large multi-file changes that can only be verified at the end. Plans
should be:

- **Achievable** — small enough to verify in one step
- **Testable** — each step has a clear pass/fail check
- **Incremental** — replace one piece, verify it works, then proceed

If something is marked as fragile in the docs or by reviewers, believe it.

## What requires explicit approval

Per [AGENTS.md](AGENTS.md):

- Modifying `tsconfig.json` requires explicit approval.
- Modifying `eslint.config.js` requires explicit approval.
- The build must produce **zero** ESLint warnings on `./src` — fix the
  source, do not relax the rules.

## Keeping docs consistent

When adding or renaming a file, update any `.md` files that link to it.
When adding a new concept or section, check whether an existing doc already
covers it — prefer extending one place over splitting the explanation across
two. Run `npm run lint:md` before committing doc changes; it catches dead
links and broken anchors across all Markdown files in the repo.

## Releasing

### 1. Update the changelog

In `CHANGELOG.md`, move everything under `## [Unreleased]` into a
new versioned section:

```markdown
## [1.0.1] - 2026-05-22

### Fixed
- ...
```

Leave a fresh empty `## [Unreleased]` block at the top for the next cycle.

### 2. Bump the version

```bash
npm version patch   # 1.0.0 → 1.0.1
# or: minor (1.0.0 → 1.1.0)  major (1.0.0 → 2.0.0)
```

`npm version` updates `package.json` and creates a git commit + tag
(`v1.0.1`) automatically. Do not edit `package.json` by hand for this.

### 3. Verify

```bash
npm run verify                               # build + lint:check
npm run test:cov && npm run test:jest:cov    # both suites, 100% coverage
npm run lint:md                              # no dead links or broken anchors
```

All three must pass before publishing.

### 4. Inspect the tarball

```bash
npm pack --dry-run
```

The tarball must include: `build/`, `module/`, `src/`, `docs/`, `.ai/`,
`examples/`, `README.md`, `FOR_HUMANS.md`, `AGENTS.md`, `SKILL.md`,
`CONTRIBUTING.md`, `LICENSE`.

It must **not** include: `test/`, `test-jest/`, `test-ts/`, `test_async/`,
`reports/`, `.husky/`, `node_modules/`.
