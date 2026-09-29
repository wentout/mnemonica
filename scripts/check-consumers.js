'use strict';

// Consumer declaration-emit guard (npm run test:ts:consumers).
//
// The fixtures under ./fixtures are compiled as an OUTSIDE consumer on
// TypeScript 6 with declaration: true — each file in its own temp dir
// OUTSIDE the package, with mnemonica linked as a real node_modules
// package against the built output. An in-repo compile cannot stand in:
// from inside the package root TS writes a relative
// import("../build/types").Name and judges it portable, so the
// failure this guard exists for does not reproduce.
//
// Expectations (the guard fails if EITHER side flips):
//   b1/b2/b3/b5/m1 — the documented builder and merge patterns MUST
//                    compile and emit declarations (TS 6 portability);
//   n1/n2          — naive exports MUST still fail with TS2883 (the
//                    internal registry names stay private on purpose).
//
// The compiler is core's own toolchain (TypeScript 6) — the same
// compiler consumers meet.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const coreRoot = path.join(__dirname, '..');
const fixturesDir = path.join(coreRoot, 'test-consumers', 'fixtures');
const tsc = path.join(coreRoot, 'node_modules', '.bin', 'tsc');

// expected outcome per fixture: true = must compile, false = must fail with TS2883
const expectations = {
	'b1-builder-chain.ts' : true,
	'b2-lookup.ts'        : true,
	'b3-instance.ts'      : true,
	'b5-registry-bridge.ts' : true,
	'm1-free-merge.ts'    : true,
	'n1-naive-define.ts'  : false,
	'n2-naive-subtype.ts' : false
};

const compileFixture = (file) => {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mnem-consumer-'));
	const nm = path.join(tmp, 'node_modules');
	fs.mkdirSync(nm, { recursive: true });
	fs.symlinkSync(coreRoot, path.join(nm, 'mnemonica'), 'dir');
	fs.copyFileSync(path.join(fixturesDir, file), path.join(tmp, 'index.ts'));
	fs.writeFileSync(path.join(tmp, 'tsconfig.json'), JSON.stringify({
		compilerOptions : {
			target              : 'ES2022',
			module              : 'NodeNext',
			moduleResolution    : 'NodeNext',
			strict              : true,
			declaration         : true,
			emitDeclarationOnly : true,
			outDir              : './out'
		},
		include : [ 'index.ts' ]
	}, null, '\t'));
	const run = spawnSync(tsc, [ '-p', path.join(tmp, 'tsconfig.json') ], {
		cwd : coreRoot, encoding : 'utf-8'
	});
	const text = (run.stdout || '') + (run.stderr || '');
	const ts2883 = (text.match(/TS2883/g) || []).length;
	fs.rmSync(tmp, { recursive: true, force: true });
	return { exit : run.status, ts2883, text };
};

let failures = 0;
for (const [ file, mustCompile ] of Object.entries(expectations)) {
	const result = compileFixture(file);
	if (mustCompile) {
		if (result.exit === 0) {
			console.log(`PASS  ${file} — compiles, declarations emit`);
		} else {
			failures++;
			console.error(`FAIL  ${file} — expected compile, got exit ${result.exit} (${result.ts2883}× TS2883)`);
			console.error(result.text.split('\n').filter((l) => l.includes('error TS')).slice(0, 3).join('\n'));
		}
	} else {
		if (result.exit !== 0 && result.ts2883 > 0) {
			console.log(`PASS  ${file} — still fails with TS2883 (${result.ts2883}×) as required`);
		} else {
			failures++;
			console.error(`FAIL  ${file} — expected TS2883 failure, got exit ${result.exit}`);
		}
	}
}

if (failures > 0) {
	console.error(`test:ts:consumers — ${failures} expectation(s) flipped`);
	process.exit(1);
}
console.log('test:ts:consumers — all consumer declaration-emit expectations hold');
