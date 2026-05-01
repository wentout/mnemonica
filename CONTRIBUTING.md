# Contributing to mnemonica

Thanks for your interest in mnemonica. This document covers the local
development loop. Repository conventions and code style live in
[AGENTS.md](AGENTS.md); release notes live in [CHANGELOG.md](CHANGELOG.md).

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
feat: add lookupTyped overload for nested registry
fix(InstanceCreator): preserve __args__ across async chain
docs: clarify exposeInstanceMethods default
chore(ci): bump setup-node to v4
```

The `pre-commit` hook runs `lint-staged`, which auto-fixes ESLint issues
on staged `src/**/*.ts` and `test/**/*.js`.

## Branching

- `master` — published releases.
- `proto` — staging branch for the next release.
- Feature branches branch off `proto` and merge back via PR.

## What requires explicit approval

Per [AGENTS.md](AGENTS.md):

- Modifying `tsconfig.json` requires explicit approval.
- Modifying `eslint.config.js` requires explicit approval.
- The build must produce **zero** ESLint warnings on `./src` — fix the
  source, do not relax the rules.

## Releasing

1. Update `CHANGELOG.md` with the new version's notes.
2. Bump `version` in `package.json`.
3. `npm run verify` (build + lint:check).
4. `npm run test:cov && npm run test:jest:cov` (both 100% coverage).
5. `npm pack --dry-run` and verify the tarball includes `build/`,
   `module/`, `README.md`, `LICENSE`, and does **not** include
   `test/decorate.js` or `test/example.js`.
6. Tag and publish.
