# test-map.md — the mocha suite, walked and mapped

What each core mocha test does and which library lines it uses. Produced by
actually step-walking the suite under CDP (`npm run debug`), not by reading
alone: the traces below are recorded `Debugger.stepInto`
paths through `new UserType(USER_DATA)` and a `@decorate()`-driven
`define()`. The full suite passes in about a second.

## Walking it yourself

```bash
npm run debug   # tsc, then mocha --inspect-brk test/index
```

Attach via chrome://inspect, VS Code, or the ready CDP driver — with the
debug suite listening, `node scripts/cdp-walk-tests.js [define|construct|both]`
re-runs the recorded stepInto walks and writes them to `$WALK_OUT`
(default `/tmp/mnem-walk.txt`). Hard-won notes:

- Mocha **re-spawns** node: the process that owns :9229 is the child
  (`node --inspect-brk .../mocha/lib/cli/cli.js test/index.js`).
- Break-on-start is NOT a debugger pause — the target waits for
  `Runtime.runIfWaitingForDebugger`. `Debugger.resume` there answers
  -32000 "Can only perform operation while paused", and `Debugger.pause`
  on an idle event loop fires nothing until the next JS turn.
- The suite carries its own breadcrumbs: two `debugger;` statements in
  `test/index.js` and two in `test/decorate.js` — grep for `debugger;` to
  find them.
- `--enable-source-maps` makes async error stacks point at `src/*.ts`.
- `test/uncaughtExceptionTest.js` installs its own
  `process.on('uncaughtException')` (stripping mocha's) and keeps the
  process alive after the run — kill leftover suites by the 9229 listener,
  or the next launch dies with "address already in use" and runs
  inspector-less.

## The construction, empirically: `new UserType(USER_DATA)`

Recorded stepInto spine (named by src/ module + function; the walk ran on
build/, which mirrors src/):

```
test/index.js  const user = new UserType(USER_DATA)
└─ TypeProxy.construct            src/api/types/TypeProxy.ts (the construct trap)
   ├─ createMnemosyne             src/api/types/Mnemosyne.ts
   │  ├─ reflectPrimitiveWrappers src/api/utils/index.ts  (Boolean/Number/... roots)
   │  └─ new Mnemosyne            Mnemosyne.ts  (memory layer, Mnemonica root, symbols from src/constants)
   └─ InstanceCreator             src/api/types/InstanceCreator.ts
      ├─ runSetup                 InstanceCreator.ts
      │  ├─ the TEST's own ModificatorConstructor runs here:
      │  │  test/createInstanceModificator200XthWay.js (its two entry points)
      │  ├─ compileNewModificatorFunctionBody (innerResult)  src/api/types/compileNewModificatorFunctionBody.ts
      │  ├─ get args              the InstanceCreator context's args getter
      │  └─ runBlockErrorsCheck   InstanceCreator.ts
      ├─ invokePreHooks           InstanceCreator.ts
      │  └─ invokeHook → HookInvocation  src/api/hooks/invokeHook.ts, HookInvocation.ts
      │     ├─ collection hooks: test/index.js (defaultTypes preCreation + flowChecker)
      │     └─ type hooks:       test/index.js (UserType's registered preCreation)
      └─ runBuild                 InstanceCreator.ts
         ├─ makeInstanceModificator  src/api/types/InstanceModificator.ts
         │  └─ ancient 200Xth way: TripleSchemeClosure → _addProps (the 9 internal props,
         │     src/api/types/Props.ts) → Inherico   test/createInstanceModificator200XthWay.js
         └─ the compiled modificator body `UserType`  compileNewModificatorFunctionBody.ts
            └─ >>> user code: the UT construct handler in test/index.js (this.email = email)
```

At the moment the user constructor runs, the instance is already shaped:
`Object.getPrototypeOf(this).constructor.name === "UserType"`, own props
still `[]` — identity first, data second. That is the README pipeline line,
verified frame by frame:

`TypeProxy.construct → createMnemosyne → InstanceCreator → preCreation hooks
→ memory layer + props (WeakMap) → your constructor → postCreation hooks`.

## The definition, empirically: `define()` via `@decorate()`

Recorded from the first breadcrumb in `test/decorate.js`, spine:

```
decorate                          src/index.ts
└─ decorator                      src/index.ts
   └─ define                      src/index.ts
      ├─ checkThis                src/index.ts   (whose `this` — module/facade/collection)
      ├─ TypesCollection proxy get  src/descriptors/types/index.ts
      └─ api define               src/api/types/index.ts
         ├─ checkTypeName         src/api/utils/index.ts
         ├─ resolveDefinitionContext  src/api/types/index.ts (dotted path → parent lookup)
         └─ createFromDirectHandler   src/api/types/index.ts
            ├─ isClass            src/api/utils/index.ts  ← the isClass discussed so often
            ├─ compileNewModificatorFunctionBody (outerResult)
            ├─ hop                src/utils/hop.ts
            └─ TypeDescriptor     src/api/types/index.ts
               └─ getStack        src/api/errors/index.ts  (submitStack)
```

## The suite map (test/)

`index.js` is the single mocha entry; every other module is pulled in by it
(directly or chained). Modules marked (helper) carry no `it`s of their own.

| Module | Verifies | Dominant src exercised |
|---|---|---|
| `index.js` preamble | The shared fixture graph: `define('UserType', UT, mc)` with a CUSTOM ModificatorConstructor, hooks registration, `lazy` subtypes, extra collections, `apply/call/bind`, async type defs, the NestedSubError chain | `src/index.ts`, `api/types/*` |
| `index.js` describes | Type-definition contract (subtypes Map, proto equality, isSubType, constructHandler), instanceof rules, util.inspect naming, error matrix for `extract/pick/collectConstructors`, strictChain PRIMARY/SECONDARY/Third (WRONG_MODIFICATION_PATTERN incl. renamed-constructor detection and ruined chains), assigned/missing chain fields, `define()` refactored-path coverage (facade `this`, lazy forms, error messages) | `src/index.ts`, `api/errors/`, `api/types/InstanceCreator.ts` |
| `environment.js` (135 its) | The public interface surface itself; constructHandler return semantics; `getProps/setProps`; stack cleaners; wrong-definition error matrix; cross-collection DAG (`Type.bind(process)`); `merge`; `.exception()` | `src/index.ts`, `api/errors/`, `api/types/Props.ts` |
| `async.chain.js` (45) | Async constructors: `unchain`, null resolution, no-return WRONG_MODIFICATION_PATTERN, `hookData.throwModificationError()`, mixed sync/async deep chains, blocked vs plain errors (`blockErrors`), error identity up the chain | `api/types/InstanceCreator.ts`, `api/errors/`, `api/hooks/invokeHook.ts` |
| `hooks.js` (8 literal + generated) | EXACT hook/flow-checker invocation counts and `this` bindings — a tripwire: adding types/instances on defaultTypes elsewhere breaks it (count archaeology in comments) | `api/hooks/*` |
| `parse.js` (9 + ~26 generated) | `utils.parse` wrong invocations, chain root symbols, broken-chain errors, deep compare vs `parseSamples.js` (self-counting: 25 generated its) | `utils/parse.ts`, `api/types/Mnemosyne.ts` |
| `nested.js` (15) | Old-style (fn+proto) vs class-based nested types, `ogp^3` chain shape, construction without `new`, cross-sibling construction, Shaper non-instanceof | `api/types/InstanceCreator.ts`, `api/types/Mnemosyne.ts` |
| `nested.more.js` (41) | `collectConstructors` 19-name spine, extract/toJSON equivalence, `lookup` (relative-first + root fallback, dotted paths, error matrix), `.parent('A.B')` semantics, strictChain-off re-construction, subtype lookup caching | `src/index.ts`, `utils/parent.ts`, `utils/collectConstructors.ts` |
| `instance.proto.js` (27) | The `getProps` contract prop by prop (`__args__`, `__type__`, `__collection__`, `__subtypes__`, `__parent__`, `__timestamp__`, `__stack__`, `__proto_proto__`), `clone`/`fork`, construction onto foreign `this` (primitive wrappers, `process`), TypeProxy call/apply/bind traps | `api/types/Props.ts`, `api/types/TypeProxy.ts`, `utils/{fork,clone}.ts` |
| `modificator.prototype.swap.js` (10) | The construction-time prototype handling in `compileNewModificatorFunctionBody.ts` — grafting onto the lineage via `Reflect.construct` with `new.target`, the user prototype left untouched, one user constructor shared by two types; isolated collection on purpose (keeps hooks.js counts stable) | `api/types/compileNewModificatorFunctionBody.ts` |
| `utils.js` (22) | `exception`, `sibling` proxy, `fork`, `clone` — via direct `require('../build/utils/*')`, bypassing the public API on purpose | `utils/{exception,sibling,fork,clone,extract}.ts` |
| `hott-laws.js` (6) | Executable witnesses for `docs/hott-correspondence.md`: path types, monad right identity + associativity, nominal identity, path uniqueness, comparator determinism | `src/index.ts`, `utils/collectConstructors.ts`, `api/types/Mnemosyne.ts` |
| `uncaughtExceptionTest.js` (1) | An async-thrown constructor error arrives via process `uncaughtException` as a full mnemonica error (instanceof chain + `__args__`); owns the process lifecycle | `api/errors/`, `api/types/InstanceCreator.ts` |
| `collection-decorate.js` (3) | `createTypesCollection().decorate()` root + subtype + config passthrough | `src/index.ts`, `descriptors/types/` |
| `decorate-builder.check.js` (2) | Builder-mode parent + `.decorate` as a decorator factory, combined with typeomatica `@Strict` | `src/index.ts` |
| `decorate.js` (helper/fixture) | tsc-compiled `decorate.ts`: every `@decorate()` form (bare, config, stacked Strict, parent-passed, class-extends-function, decorated-class-as-factory); exports the my* instances asserted in environment.js; holds the two breadcrumbs | `src/index.ts`, `api/types/InstanceCreator.ts` |
| `createInstanceModificator200XthWay.js` (helper) | The "ancient" custom ModificatorConstructor: manual triple-closure scheme, `goneToFallback` getter + fallback to `defaultOptions.ModificationConstructor` — the reason index.js's `goneToFallback` assertions exist | `api/types/InstanceModificator.ts`, `constants/` |
| `bindProtoMethods.js` + `boundMethodErrorHandler.js` (helpers) | Legacy bound-method machinery used by async fixtures: getter-installed wrappers, `exceptionReason`/`reasons`/`surplus` packaging via `setProps` (never own props) | `api/types/Props.ts`, `utils/exception.ts` |
| `throw-type-error.js` (fixture) | A constructor that intentionally throws TypeError; drives uncaughtExceptionTest | `api/types/InstanceCreator.ts` error path |
| `instance-methods-helper.js` (helper) | `withInstanceMethods()` — re-adds pre-v1.0.6 instance methods (`extract/pick/parent/clone/fork/exception/sibling`) as prototype getters over `utils.*`; the documented userland migration pattern | `utils/*` |

## Cross-cutting truths the walk made visible

- **A custom ModificatorConstructor is not decoration — it is inside the
  pipeline.** `runSetup` in InstanceCreator.ts invokes the test's
  `createInstanceModificator200XthWay` before hooks fire.
- **Hook order is observable**: the defaultTypes collection preCreation hook
  runs before UserType's type preCreation hook (both in test/index.js)
  within the same construction.
- **The 9 internal props are written by `_addProps`** (src/api/types/Props.ts)
  during `makeInstanceModificator`, before user code — matching the
  FOR_HUMANS.md internal-properties table.
- **hooks.js counts are a pact between files**: hott-laws.js and
  modificator.prototype.swap.js document their exact contribution; add a
  type on defaultTypes and hooks.js fails.
