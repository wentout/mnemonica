'use strict';

/**
 * mnemonica benchmark suite
 *
 * Dimensions:
 *   1. Type definition overhead
 *   2. Instance creation (shallow / deep chains)
 *   3. instanceof checks
 *   4. parent() / prototype access
 *   5. Deep property access
 *   6. Subtype lookup (proxy get)
 *   7. Memory footprint
 *   8. Comparison with plain JS equivalents
 *
 * Run: node test/benchmark.js
 */

const { define } = require('..');

// --- harness ---

function bench (name, fn, opts = {}) {
	const {
		warmup = 3,
		runs   = 10,
		N      = 10000,
		unit   = 'ops/sec',
	} = opts;

	// sink array prevents dead-code elimination
	const sink = [];

	// warmup
	for (let i = 0; i < warmup; i++) sink.push(fn(N));

	const times = [];
	for (let i = 0; i < runs; i++) {
		if (global.gc) global.gc();
		const t0 = process.hrtime.bigint();
		sink.push(fn(N));
		const t1 = process.hrtime.bigint();
		times.push(Number(t1 - t0));
	}

	const mean = times.reduce((a, b) => a + b, 0) / runs;
	const sorted = times.slice().sort((a, b) => a - b);
	const median = sorted[ Math.floor(runs / 2) ];
	const [ min ] = sorted;
	const max    = sorted[ sorted.length - 1 ];
	const ops    = (N / (mean / 1e9)).toFixed(0);

	console.log(
		`${name.padEnd(45)} ${ops.padStart(10)} ${unit}  ` +
		`median=${(median / 1e6).toFixed(2)}ms  ` +
		`min=${(min / 1e6).toFixed(2)}ms  ` +
		`max=${(max / 1e6).toFixed(2)}ms`
	);
}

function mem (name, fn) {
	if (!global.gc) {
		console.log(`${name.padEnd(45)} --node --expose-gc required for memory test`);
		return;
	}
	global.gc();
	const memBefore = process.memoryUsage();
	fn();
	const memAfter = process.memoryUsage();
	const deltaHeap = ((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2);
	console.log(`${name.padEnd(45)} +${deltaHeap.padStart(8)} MB heap`);
}

// --- fixtures ---

const Shallow = define('Shallow', function (n) {
	this.n = n;
});

const Chain10Root = define('Chain10_0', function () { this.v0 = 0; });
const Chain10Names = [ 'Chain10_0' ];
(() => {
	let t = Chain10Root;
	for (let i = 1; i < 10; i++) {
		t = t.define(`Chain10_${i}`, function () { this[ `v${i}` ] = i; });
		Chain10Names.push(`Chain10_${i}`);
	}
})();

const Chain100Root = define('Chain100_0', function () { this.v0 = 0; });
const Chain100Names = [ 'Chain100_0' ];
(() => {
	let t = Chain100Root;
	for (let i = 1; i < 100; i++) {
		t = t.define(`Chain100_${i}`, function () { this[ `v${i}` ] = i; });
		Chain100Names.push(`Chain100_${i}`);
	}
})();

// --- plain JS equivalents ---
// Each factory produces a fresh constructor with a unique prototype shape,
// preventing V8 from reusing hidden-class optimisations across iterations.

function createPlainShallowCtor () {
	function PlainShallow (n) {
		this.n = n;
	}
	PlainShallow.prototype[ `p${Math.random().toString(36)
		.slice(2, 8)}` ] = true;
	return PlainShallow;
}

function makePlainChain10 () {
	function C0 () { this.v0 = 0; }
	C0.prototype[ `p${Math.random().toString(36)
		.slice(2, 8)}` ] = true;
	let instance = new C0();

	for (let i = 1; i < 10; i++) {
		function Ci () { this[ `v${i}` ] = i; }
		Object.setPrototypeOf(Ci.prototype, instance);
		Ci.prototype[ `p${Math.random().toString(36)
			.slice(2, 8)}` ] = true;
		instance = new Ci();
	}
	return instance;
}

function makePlainChain100 () {
	function C0 () { this.v0 = 0; }
	C0.prototype[ `p${Math.random().toString(36)
		.slice(2, 8)}` ] = true;
	let instance = new C0();

	for (let i = 1; i < 100; i++) {
		function Ci () { this[ `v${i}` ] = i; }
		Object.setPrototypeOf(Ci.prototype, instance);
		Ci.prototype[ `p${Math.random().toString(36)
			.slice(2, 8)}` ] = true;
		instance = new Ci();
	}
	return instance;
}

// Pre-built plain chains for property-access benchmarks (analogous to mnemonica's deep10/deep100)
const plainDeep10  = makePlainChain10();
const plainDeep100 = makePlainChain100();

// Pre-built plain shallow instance for instanceof benchmark
const plainShallowCtorFixed = createPlainShallowCtor();
const plainShallowInst      = new plainShallowCtorFixed(42);

// --- benchmarks ---

console.log('\n=== Creation throughput ===\n');

bench('mnemonica: shallow instance creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(new Shallow(i));
	return arr;
}, { N : 20000 });

bench('plain: shallow instance creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) {
		const Ctor = createPlainShallowCtor();
		arr.push(new Ctor(i));
	}
	return arr;
}, { N : 20000 });

bench('mnemonica: 10-level chain creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) {
		let instance = new Chain10Root();
		for (let j = 1; j < 10; j++) {
			instance = new instance[ Chain10Names[ j ] ]();
		}
		arr.push(instance);
	}
	return arr;
}, { N : 5000 });

bench('plain: 10-level chain creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(makePlainChain10());
	return arr;
}, { N : 5000 });

bench('mnemonica: 100-level chain creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) {
		let instance = new Chain100Root();
		for (let j = 1; j < 100; j++) {
			instance = new instance[ Chain100Names[ j ] ]();
		}
		arr.push(instance);
	}
	return arr;
}, { N : 500 });

bench('plain: 100-level chain creation', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(makePlainChain100());
	return arr;
}, { N : 500 });

console.log('\n=== instanceof / identity ===\n');

const shallowInst = new Shallow(42);

bench('mnemonica: instanceof Shallow', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(shallowInst instanceof Shallow);
	return arr;
}, { N : 500000 });

bench('plain: instanceof constructor', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(plainShallowInst instanceof plainShallowCtorFixed);
	return arr;
}, { N : 500000 });

console.log('\n=== parent() / prototype access ===\n');

bench('mnemonica: instance.parent()', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(shallowInst.parent());
	return arr;
}, { N : 200000 });

bench('plain: Object.getPrototypeOf()', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(Object.getPrototypeOf(plainShallowInst));
	return arr;
}, { N : 200000 });

console.log('\n=== deep property access ===\n');

const deep10 = (() => {
	let instance = new Chain10Root();
	for (let j = 1; j < 10; j++) {
		instance = new instance[ Chain10Names[ j ] ]();
	}
	return instance;
})();

const deep100 = (() => {
	let instance = new Chain100Root();
	for (let j = 1; j < 100; j++) {
		instance = new instance[ Chain100Names[ j ] ]();
	}
	return instance;
})();

bench('mnemonica: read prop on 10-level chain', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(deep10.v0);
	return arr;
}, { N : 500000 });

bench('plain: read prop on 10-level chain', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(plainDeep10.v0);
	return arr;
}, { N : 500000 });

bench('mnemonica: read prop on 100-level chain', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(deep100.v0);
	return arr;
}, { N : 500000 });

bench('plain: read prop on 100-level chain', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(plainDeep100.v0);
	return arr;
}, { N : 500000 });

console.log('\n=== subtype lookup (proxy get) ===\n');

const L1 = define('LookupRoot', function () {});
L1.define('LookupL2', function () {});
const lookupInst = new L1();

bench('mnemonica: subtype lookup (hit)', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(lookupInst.LookupL2);
	return arr;
}, { N : 200000 });

bench('mnemonica: subtype lookup (miss)', (N) => {
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(lookupInst.NonExistent);
	return arr;
}, { N : 200000 });

bench('plain: property lookup (hit)', (N) => {
	const o = { L2 : null };
	const arr = [];
	for (let i = 0; i < N; i++) arr.push(o.L2);
	return arr;
}, { N : 200000 });

console.log('\n=== memory footprint ===\n');

mem('mnemonica: 10k shallow instances', () => {
	const arr = [];
	for (let i = 0; i < 10000; i++) arr.push(new Shallow(i));
});

mem('plain: 10k shallow instances', () => {
	const arr = [];
	for (let i = 0; i < 10000; i++) {
		const Ctor = createPlainShallowCtor();
		arr.push(new Ctor(i));
	}
});

mem('mnemonica: 1k 100-level chains', () => {
	const arr = [];
	for (let i = 0; i < 1000; i++) {
		let instance = new Chain100Root();
		for (let j = 1; j < 100; j++) {
			instance = new instance[ Chain100Names[ j ] ]();
		}
		arr.push(instance);
	}
});

mem('plain: 1k 100-level chains', () => {
	const arr = [];
	for (let i = 0; i < 1000; i++) arr.push(makePlainChain100());
});

console.log('\n=== Done ===\n');
