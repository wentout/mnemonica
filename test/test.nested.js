'use strict';

const { assert, expect } = require('chai');

const {
	defaultTypes: types,
} = require('..');

const test = (opts) => {

	const {
		user,
		userPL1,
		userPL2,
		pl1Proto,
		pl2Proto,
		userPL_NoNew,
		userPL_1_2,
		UserTypeProto,
		USER_DATA,
	} = opts;

	describe('nested type with old style check', () => {
		it('actually do construction', () => {
			assert.instanceOf(userPL1, types.UserType.subtypes.UserTypePL1);
			assert.instanceOf(userPL1, user.UserTypePL1);
			assert.equal(
				// Object.getPrototypeOf(
				Object.getPrototypeOf(
					Object.getPrototypeOf(
						// Object.getPrototypeOf(userPL1)))),
						Object.getPrototypeOf(userPL1))),
				user
			);
			assert.equal(
				// Object.getPrototypeOf(
				Object.getPrototypeOf(
					Object.getPrototypeOf(
						// Object.getPrototypeOf(userPL2)))),
						Object.getPrototypeOf(userPL2))),
				user
			);
		});
		it('.constructor.name is correct', () => {
			assert.equal(userPL1.constructor.name, 'UserTypePL1');
		});
		it('.prototype is correct', () => {
			expect(userPL1.constructor.prototype).to.be.an('object')
				.that.includes(pl1Proto);
			Object.entries(pl1Proto).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userPL1[key], value);
			});
		});
		it('definition is correct', () => {
			const checker = {
				user_pl_1_sign: 'pl_1',
			};
			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.isTrue(userPL1.hasOwnProperty(key));
				assert.equal(userPL1[key], value);
			});
		});
	});

	describe('nested type with new style check', () => {
		it('actually do construction', () => {
			assert.instanceOf(userPL2, types.UserType.subtypes.UserTypePL2);
			assert.instanceOf(userPL2, user.UserTypePL2);
		});
		it('.constructor.name is correct', () => {
			assert.equal(userPL2.constructor.name, 'UserTypePL2');
		});
		it('can construct without "new" keyword', () => {
			assert.instanceOf(userPL_NoNew, types.UserType);
			assert.instanceOf(userPL_NoNew, types.UserType.subtypes.UserTypePL2);
		});
		it('and insanceof stays ok', () => {
			assert.instanceOf(userPL_NoNew, user.UserTypePL2);
		});
		it('and even for sibling type', () => {
			assert.instanceOf(userPL_1_2, userPL1.UserTypePL2);
		});
		it('and for sibling type constructed without "new"', () => {
			assert.instanceOf(userPL_NoNew, userPL1.UserTypePL2);
		});
		it('.prototype is correct', () => {
			expect(userPL2.constructor.prototype)
				.to.be.an('object')
				.that.includes(pl2Proto);
		});
		it('definitions are correct 4 class instances', () => {
			const checker = Object.assign({
				user_pl_2_sign: 'pl_2',
				description: UserTypeProto.description
			}, USER_DATA, pl2Proto);
			Object.keys(USER_DATA).forEach(key => {
				assert.isFalse(userPL2[key].hasOwnProperty(key));
				assert.equal(userPL2[key], USER_DATA[key]);
			});

			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userPL2[key], value);
			});
		});
		it('definitions are correct for general', () => {
			const checker = Object.assign({
				user_pl_1_sign: 'pl_1',
				description: UserTypeProto.description
			}, USER_DATA, pl1Proto);
			Object.keys(USER_DATA).forEach(key => {
				assert.isFalse(userPL1[key].hasOwnProperty(key));
			});
			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userPL1[key], value);
			});
		});
	});
};

module.exports = test;
