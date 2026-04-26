# Examples

Standalone scripts that demonstrate edge cases and document JavaScript /
Node.js behaviors that mnemonica has to work around. They are runnable
from the project root after `npm run build`:

```bash
npm run example:async    # AsyncNewTest.js
npm run example:rename   # ClassReName.js
npm run example:v8bug    # v8bug.js
```

## AsyncNewTest.js

Minimal demonstration that an `async function` does **not** have a
`prototype` property and therefore cannot be invoked with `new`. Mnemonica
must detect this case and route async constructors through a different
path. Useful when reasoning about why `define(name, async fn)` needs
special handling.

## ClassReName.js

Shows how `Object.defineProperty(Ctor.prototype.constructor, 'name', …)`
gives a class a runtime-renamed `constructor.name`. This is the technique
mnemonica uses internally to make every defined type's instance report
its declared `TypeName`, instead of the literal source-level identifier.
The "v8 bug" referenced in `v8bug.js` is the reason this technique
matters.

## v8bug.js

Documents a Node.js 22 regression in how `Object.prototype.hasOwnProperty`
treats the `stack` property of objects whose prototype chain includes an
`Error`. On Node 20 it returns `true` after assignment; on Node 22+ V8
optimizes the assignment away unless `Object.defineProperty` is used.
Mnemonica's stack-cleaning logic must use the getter pattern shown at the
bottom of the file for cross-version compatibility.

These are regression notes, not tutorials. For user-facing examples and
the public API, start with [`README.md`](../README.md).
