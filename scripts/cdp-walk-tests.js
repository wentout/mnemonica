'use strict';

/**
 * cdp-walk-tests.js — step-through driver for the mocha suite (CDP).
 *
 * Usage:
 *   1. terminal A: npm run debug        (mocha --inspect-brk on :9229)
 *   2. terminal B: node scripts/cdp-walk-tests.js [define|construct|both]
 *
 * Env: CDP_PORT (default 9229), WALK_OUT (default /tmp/mnem-walk.txt).
 *
 * Recorded results and the CDP lessons (mocha re-spawns node; the
 * runIfWaitingForDebugger ceremony; the suite's own `debugger;`
 * breadcrumbs at test/index.js:27,:82 and test/decorate.js:418,:453)
 * live in .ai/test-map.md.
 */

const fs = require('fs');

const CDP_PORT = process.env.CDP_PORT || 9229;
const OUT = process.env.WALK_OUT || '/tmp/mnem-walk.txt';
const MODE = process.argv[2] || 'both';
const STEPS = 2000;

const TEST_FILE = 'file:///code/mnemonica/core/test/index.js';
const LINE_DEFINE = 82;      // 0-based: `const UserType = mnemonica.define(...)` (line 83)
const LINE_CONSTRUCT = 281;  // 0-based: `const user = new UserType(USER_DATA)` (line 282)
const LINE_USER_CODE = 75;   // 1-based target inside UT: `this.email = email`

const log = (...args) => fs.appendFileSync(OUT, args.join(' ') + '\n');

async function main () {
	fs.writeFileSync(OUT, '');
	const listResponse = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
	const targets = await listResponse.json();
	const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		ws.onopen = resolve;
		ws.onerror = reject;
	});

	let nextId = 1;
	const pending = new Map();
	const scripts = new Map();
	let pausedResolve = null;
	const pausedQueue = [];

	ws.onmessage = (event) => {
		const msg = JSON.parse(String(event.data));
		if (msg.id && pending.has(msg.id)) {
			const entry = pending.get(msg.id);
			pending.delete(msg.id);
			if (msg.error) {
				entry.reject(new Error(JSON.stringify(msg.error)));
			} else {
				entry.resolve(msg.result);
			}
		} else if (msg.method === 'Debugger.scriptParsed') {
			scripts.set(msg.params.scriptId, msg.params.url || '');
		} else if (msg.method === 'Debugger.paused') {
			if (pausedResolve) {
				const resolve = pausedResolve;
				pausedResolve = null;
				resolve(msg.params);
			} else {
				pausedQueue.push(msg.params);
			}
		}
	};

	const send = (method, params = {}) => new Promise((resolve, reject) => {
		const id = nextId++;
		pending.set(id, { resolve, reject });
		ws.send(JSON.stringify({ id, method, params }));
	});

	const nextPause = (ms = 20000) => Promise.race([
		pausedQueue.length
			? Promise.resolve(pausedQueue.shift())
			: new Promise((resolve) => { pausedResolve = resolve; }),
		new Promise((_, reject) => setTimeout(() => reject(new Error('pause timeout')), ms)),
	]);

	const loc = (params) => {
		const frame = params.callFrames[0];
		const url = frame.url || scripts.get(frame.location.scriptId) || '';
		const short = url
			.replace(/^file:\/\//, '')
			.replace('/code/mnemonica/core/', '<core>/');
		const text = `${frame.functionName || '(anon)'} @ ${short}:${frame.location.lineNumber + 1}`;
		return { text, depth : params.callFrames.length, frame };
	};

	const interesting = (text) => (
		text.includes('<core>/src/')
		|| text.includes('<core>/build/')
		|| text.includes('<core>/test/')
	) && !text.includes('node_modules');

	await send('Debugger.enable');
	await send('Runtime.enable');
	await send('Debugger.setBreakpointByUrl', { url : TEST_FILE, lineNumber : LINE_DEFINE });
	await send('Debugger.setBreakpointByUrl', { url : TEST_FILE, lineNumber : LINE_CONSTRUCT });
	// break-on-start is an inspector hold, not a debugger pause:
	// Debugger.resume answers -32000 here — release it this way
	await send('Runtime.runIfWaitingForDebugger');

	const seekBreakpoint = async (lineNumber) => {
		for (let i = 0; i < 15; i++) {
			const pause = await nextPause();
			const at = loc(pause);
			log('pause while seeking:', at.text);
			if (at.text.includes(`<core>/test/index.js:${lineNumber}`)) {
				const result = { pause, at };
				return result;
			}
			await send('Debugger.resume');
		}
		throw new Error(`breakpoint at test/index.js:${lineNumber} never hit`);
	};

	const walkDefine = async () => {
		const { at } = await seekBreakpoint(LINE_DEFINE + 1);
		log('');
		log(`--- WALK define: ${at.text} ---`);
		const baseDepth = at.depth;
		for (let i = 0; i < STEPS; i++) {
			await send('Debugger.stepInto');
			const pause = await nextPause();
			const at2 = loc(pause);
			if (at2.text.includes('<core>/test/index.js') && at2.depth <= baseDepth && i > 0) {
				log(`(back to test file: ${at2.text} — ${i} steps)`);
				break;
			}
			if (interesting(at2.text)) {
				log(`${'  '.repeat(Math.max(0, at2.depth - baseDepth))}${at2.text}`);
			}
		}
		// walkDefine ends still paused at the test file; release so the
		// construct breakpoint (and the suite's `debugger;` breadcrumbs
		// in between) can actually fire for walkConstruct's seek loop
		await send('Debugger.resume');
	};

	const walkConstruct = async () => {
		const { at } = await seekBreakpoint(LINE_CONSTRUCT + 1);
		log('');
		log(`--- WALK construct: ${at.text} ---`);
		const baseDepth = at.depth;
		for (let i = 0; i < STEPS; i++) {
			await send('Debugger.stepInto');
			const pause = await nextPause();
			const at2 = loc(pause);
			if (at2.text.includes(`<core>/test/index.js:${LINE_USER_CODE}`)) {
				log(`>>> USER CONSTRUCTOR BODY: ${at2.text}`);
				const proto = await send('Debugger.evaluateOnCallFrame', {
					callFrameId : at2.frame.callFrameId,
					expression  : 'Object.getPrototypeOf(this).constructor.name',
				});
				log(`    prototype.constructor.name = ${JSON.stringify(proto.result.value)}`);
				break;
			}
			if (interesting(at2.text)) {
				log(`${'  '.repeat(Math.max(0, at2.depth - baseDepth))}${at2.text}`);
			}
		}
	};

	if (MODE === 'define' || MODE === 'both') {
		await walkDefine();
	}
	if (MODE === 'construct' || MODE === 'both') {
		await walkConstruct();
	}

	await send('Debugger.resume');
	log('');
	log('done; suite resumed');
	console.log(`walk written to ${OUT}`);
	process.exit(0);
}

main().catch((err) => {
	log('WALK FAILED:', err.message);
	console.error('walk failed:', err.message);
	process.exit(1);
});
