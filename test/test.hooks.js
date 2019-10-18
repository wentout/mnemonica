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
			assert.equal(2, userTypeHooksInvocations.length);
			assert.equal(37, namespaceFlowCheckerInvocations.length);
			assert.equal(37, typesFlowCheckerInvocations.length);
			assert.equal(19, typesPreCreationInvocations.length);
			// there are two errors on creation
			// checked before
			// that is why not 20, but 15 + 3 of clones
			assert.equal(18, typesPostCreationInvocations.length);
			assert.equal(19, namespacePreCreationInvocations.length);
			// there are two registered Hooks
			// that is why not 16, but 32 + 6 of clones
			assert.equal(36, namespacePostCreationInvocations.length);
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