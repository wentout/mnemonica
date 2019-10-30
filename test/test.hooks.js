'use strict';

const { assert } = require('chai');

const {
	defaultTypes : types,
	defaultNamespace,
} = require('..');

const test = (opts) => {
		
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
			assert.equal(4, userTypeHooksInvocations.length);
			assert.equal(103, namespaceFlowCheckerInvocations.length);
			assert.equal(101, typesFlowCheckerInvocations.length);
			assert.equal(51, typesPreCreationInvocations.length);
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			assert.equal(50, typesPostCreationInvocations.length);
			assert.equal(52, namespacePreCreationInvocations.length);
			// there are two registered Hooks, that is why
			assert.equal(102, namespacePostCreationInvocations.length);
		});
		it('check invocations "this"', () => {
			userTypeHooksInvocations.forEach(entry => {
				const {
					self,
					opts : {
						type
					},
					// sort,
					// kind,
				} = entry;
				// it(`"this" for ${kind}-hook of ${sort} should refer to type ${type.TypeName}`, () => {
					assert.equal(self, type);
				// });
			});
			typesPreCreationInvocations.forEach(entry => {
				const {
					self,
					// sort,
					// kind,
				} = entry;
				// it(`"this" for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
					assert.equal(self, types);
				// });
			});
			typesPostCreationInvocations.forEach(entry => {
				const {
					self,
					// sort,
					// kind,
				} = entry;
				// it(`"this" for ${kind}-hook of ${sort} should refer to type defaultTypes`, () => {
					assert.equal(self, types);
				// });
			});
			namespacePreCreationInvocations.forEach(entry => {
				const {
					self,
					// sort,
					// kind,
				} = entry;
				// it(`"this" for ${kind}-hook of ${sort} should refer to type defaultNamespace`, () => {
					assert.equal(self, defaultNamespace);
				// });
			});
			namespacePostCreationInvocations.forEach(entry => {
				const {
					self,
					// sort,
					// kind,
				} = entry;
				// it(`"this" for ${kind}-hook of ${sort} should refer to type defaultNamespace`, () => {
					assert.equal(self, defaultNamespace);
				// });
			});
		});
	});
	
	
};

module.exports = test;
