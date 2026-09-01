# Tooling around mnemonica

The library itself is runtime-only — but the ecosystem around it has grown
a toolchain for **seeing** what your type graph does. This page is the map.

| Tool | Status | What it gives you |
|---|---|---|
| [`@mnemonica/tactica`](https://www.npmjs.com/package/@mnemonica/tactica) | published | Static analysis + codegen: scans `define()`/`@decorate()` and emits `.tactica/` artifacts (types.ts, hierarchy/definitions/usages/flow JSON) |
| [`@mnemonica/dive`](https://www.npmjs.com/package/@mnemonica/dive) | published | Execution-flow tracing: wrapped calls/creations as a trace ring, errors pinned to the instance that carried them — no AsyncLocalStorage |
| [`typeomatica`](https://www.npmjs.com/package/typeomatica) | published | Runtime field-type enforcement via Proxy ([`./typeomatica.md`](./typeomatica.md)) |
| [`@mnemonica/topologica`](https://www.npmjs.com/package/@mnemonica/topologica) | published | Module loader that self-defines directory trees of types |
| `@mnemonica/nestjs` (nestjs-adapter) | in active development | NestJS wiring: DTO → validated mnemonica instance, dive tracing across DI boundaries, OTel spans (Jaeger) per request and per construction |
| mnemographica | in active development | VS Code extension: `.tactica` as tree views + interactive 3D type graph + a Live Trace sidebar fed by a running app |
| `@mnemonica/strategy` | in active development | The live bridge: attaches to a running app (CDP, or the app's own embedded WS channel) and exposes it to agents/tooling — trace streaming, and live-craft (below) |

## Two modes worth knowing about

### Watch a running application

With the nestjs adapter installed, a running app emits dive trace events and
OTel spans. mnemographica's **Live Trace** view collects them (recent traces,
errored ones in red, click to isolate in the 3D graph or open in Jaeger), and
its **App Channel** tab connects straight to the app's embedded strategy WS
channel — no debugger involved.

### Live-craft: change constructors without a restart

The strategy channel can also **define new types and swap their constructors
inside a running process** — a development mode: you craft a type and
immediately see it. Types born this way are *shimmed*: mnemonica keeps a
stable shell constructor forever while the real implementation lives behind
it, replaceable via `swap`. Source-born types are never swappable. The full
story lives in strategy's `docs/live-craft.md`.

## Debug the library's own tests (and learn the internals)

Mnemonica's own mocha suite runs under the Chrome DevTools Protocol — the
same protocol the strategy bridge uses:

```bash
npm run debug            # builds src, then mocha --inspect-brk on test/
npm run test:jest:debug  # the jest suite, likewise
```

Then open `chrome://inspect` (or attach VS Code) and step through the suite
construction by construction. Every `return` in `src/` goes through an
intermediate variable exactly so you can hover it at a `return` breakpoint —
walking the tests this way is the fastest honest tour of the internals:
proxy construction, the Mnemosyne memory layer, hooks firing, error paths.
Much better than reading logs.
