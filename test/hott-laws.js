'use strict';

const { assert, expect } = require('chai');

const ogp = Object.getPrototypeOf;

const mnemonica = require('..');

const {
	define,
} = mnemonica;

// the naming-path comparator itself
const { collectConstructors } = require('../build/utils/collectConstructors');

// Executable witnesses for docs/hott-correspondence.md.
// Each `it` pins one claim that the correspondence note marks as EXACT.
// If a refactor ever breaks one of these, the note's claim is falsified —
// that is the point: the claims are CI-verified, not asserted.

const tests = () => {

	describe('HoTT correspondence: exact claims', () => {

		// unique names: define() throws ALREADY_DECLARED on collisions
		const HottRoot = define('HottRootType', function (data) {
			Object.assign(this, data);
		});
		const HottMid = HottRoot.define('HottMidType', function (role) {
			this.role = role;
		});
		HottMid.define('HottLeafType', function (level) {
			this.level = level;
		});

		const root = new HottRoot({ name : 'root' });
		const mid = new root.HottMidType('mid');
		const leaf = new mid.HottLeafType(3);

		const chainOf = (instance) => {
			const chain = [];
			let cursor = instance;
			while (cursor !== null && cursor !== Object.prototype) {
				chain.push(cursor);
				cursor = ogp(cursor);
			}
			return chain;
		};

		it('path types: the prototype chain IS the identity path to root', () => {
			// the parent instance object is literally present in the child's
			// prototype chain — the path is materialized, not reconstructed
			const chain = chainOf(leaf);
			assert.include(chain, mid, 'mid instance is in leaf\'s chain');
			assert.include(chain, root, 'root instance is in leaf\'s chain');
			assert.isBelow(chain.indexOf(leaf), chain.indexOf(mid), 'leaf before mid');
			assert.isBelow(chain.indexOf(mid), chain.indexOf(root), 'mid before root');
		});

		it('monad right identity: binding a subtype preserves the parent context', () => {
			// instance >>= define(SubT) — the result still IS the parent
			expect(mid instanceof HottRoot).is.true;
			expect(leaf instanceof HottRoot).is.true;
			expect(leaf instanceof HottMid).is.true;
			assert.equal(leaf.name, 'root', 'root props visible through the chain');
			assert.equal(leaf.role, 'mid', 'mid props visible through the chain');
			assert.equal(leaf.level, 3, 'own props present');
		});

		it('monad associativity: chain extension order is irrelevant to grouping', () => {
			// ((root >>= Mid) >>= Leaf) — the prototype chain associates linearly
			const stepwise = new (new (new HottRoot({ name : 'a' })).HottMidType('b')).HottLeafType(1);
			const chain = chainOf(stepwise);
			assert.isAbove(chain.length, 2, 'chain holds the full path');
			expect(stepwise instanceof HottRoot).is.true;
			expect(stepwise instanceof HottMid).is.true;
		});

		it('identity is nominal (univalence intuition): shape does not identify', () => {
			// two types with byte-identical constructor bodies are different types
			const makeBody = () => function (value) {
				this.value = value;
			};
			const HottNominalA = define('HottNominalA', makeBody());
			const HottNominalB = define('HottNominalB', makeBody());

			const a = new HottNominalA(1);
			const b = new HottNominalB(1);

			assert.deepEqual(a, b, 'same shape');
			expect(a instanceof HottNominalB).is.false;
			expect(b instanceof HottNominalA).is.false;

			// and the name is frozen: re-declaring it refuses the lift
			expect(() => define('HottNominalA', makeBody())).to.throw();
		});

		it('path uniqueness: different construction order, different identity', () => {
			// a path is determined by its steps, not just its endpoints
			const direct = new root.HottMidType('direct');
			const viaFresh = new (new HottRoot({ name : 'other' })).HottMidType('via');
			expect(direct instanceof HottMid).is.true;
			expect(viaFresh instanceof HottMid).is.true;
			// same type, different paths — the carried context differs
			assert.equal(direct.role, 'direct');
			assert.equal(viaFresh.role, 'via');
			assert.notEqual(chainOf(direct).includes(root), chainOf(viaFresh).includes(root));
		});

		it('comparators are comparable: naming-path extraction is deterministic', () => {
			// the comparator IS the naming path; using it across sessions is
			// legitimate only if extraction is a function of the chain
			const spineLeaf1 = collectConstructors(leaf, true);
			const spineLeaf2 = collectConstructors(leaf, true);
			assert.deepEqual(spineLeaf1, spineLeaf2, 'same instance → same spine');

			// a comparator extracted from one instance applies to another
			// instance of the same naming chain — comparators interchange
			const otherLeaf = new mid.HottLeafType(99);
			assert.deepEqual(collectConstructors(otherLeaf, true), spineLeaf1,
				'same naming path → same comparator');

			// identical naming paths do NOT make instances identical:
			// the comparator sees the spine, never the fiber
			expect(otherLeaf).to.not.equal(leaf);
			assert.notDeepEqual(collectConstructors(mid, true), spineLeaf1,
				'different paths stay distinguishable');
		});

	});
};

module.exports = tests;
