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
			const FCC = 43;
			const TCC = 22;
			const NCI = 21;
			const PCI = 42;
			assert.equal(2, userTypeHooksInvocations.length);
			assert.equal(FCC, namespaceFlowCheckerInvocations.length);
			assert.equal(FCC, typesFlowCheckerInvocations.length);
			assert.equal(TCC, typesPreCreationInvocations.length);
			// there are two errors on creation
			// checked before
			// that is why, and with clones
			assert.equal(NCI, typesPostCreationInvocations.length);
			assert.equal(TCC, namespacePreCreationInvocations.length);
			// there are two registered Hooks, that is why
			assert.equal(PCI, namespacePostCreationInvocations.length);
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
