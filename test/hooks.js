'use strict';

const { assert } = require('chai');

const {
	defaultTypes: types,
	defaultNamespace,
} = require('..');

const tests = (opts) => {

	const {
		userTypeHooksInvocations,
		namespaceFlowCheckerInvocations,
		typesFlowCheckerInvocations,
		typesPreCreationInvocations,
		typesPostCreationInvocations,
		namespacePreCreationInvocations,
		namespacePostCreationInvocations,
	} = opts;


	describe('Hooks Tests', () => {
		it('check invocations count', () => {
			assert.equal(8, userTypeHooksInvocations.length);
			// debugger;
			// +2
			assert.equal(145, namespaceFlowCheckerInvocations.length);
			// +2
			assert.equal(143, typesFlowCheckerInvocations.length);
			// +1
			assert.equal(77, typesPreCreationInvocations.length);
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			// +1
			assert.equal(66, typesPostCreationInvocations.length);
			// +1
			assert.equal(78, namespacePreCreationInvocations.length);
			// there are two registered Hooks, that is why
			// +2
			assert.equal(134, namespacePostCreationInvocations.length);
		});
	});

	describe('check invocations of "this"', () => {
		userTypeHooksInvocations.forEach(entry => {
			const {
				self,
				opts: {
					type
				},
				sort,
				kind,
			} = entry;
			it(`'this' for ${kind}-hook of ${sort} should refer to type ${type.TypeName}`, () => {
				assert.equal(self, type);
			});
		});
		typesPreCreationInvocations.forEach(entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it(`'this' for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
				assert.equal(self, types);
			});
		});
		typesPostCreationInvocations.forEach(entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it(`'this' for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
				assert.equal(self, types);
			});
		});
		namespacePreCreationInvocations.forEach(entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it(`'this' for ${kind}-hook of ${sort} should refer to type defaultNamespace`, () => {
				assert.equal(self, defaultNamespace);
			});
		});
		namespacePostCreationInvocations.forEach(entry => {
			const {
				self,
				sort,
				kind,
			} = entry;
			it(`'this' for ${kind}-hook of ${sort} should refer to type defaultNamespace`, () => {
				assert.equal(self, defaultNamespace);
			});
		});
	});
	
};

module.exports = tests;
