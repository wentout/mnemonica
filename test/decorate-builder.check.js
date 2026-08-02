'use strict';

const { expect } = require('chai');

const {
	builderUserInstance,
	builderAdminInstance,
	builderStrictAdminInstance,
} = require('./decorate-builder');

const tests = () => {

	describe('builder-node decorate tests', () => {

		it('builder-node decorate defines subtypes on a builder-defined parent', () => {
			expect(builderUserInstance.name.valueOf()).equal('builder');
			expect(builderAdminInstance.role.valueOf()).equal('admin');
			expect(builderAdminInstance.name.valueOf()).equal('builder');
		});

		it('builder-node decorate works with @Strict from typeomatica', () => {
			expect(builderStrictAdminInstance.role.valueOf()).equal('admin');
			expect(builderStrictAdminInstance.strictField.valueOf()).equal('strict');
			expect(builderStrictAdminInstance.name.valueOf()).equal('builder');
			expect(builderStrictAdminInstance).instanceOf(builderUserInstance.constructor);
		});

	});

};

module.exports = tests;
