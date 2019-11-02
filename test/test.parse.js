'use strict';

const { assert, expect } = require('chai');

const {
	SymbolConstructorName,
	SymbolDefaultNamespace,
	utils: {
		parse
	},
	errors,
} = require('..');

const test = (opts) => {

	const {
		user,
		userPL1,
		userPL2,
		userTC,
		evenMore,
		EmptyType,
	} = opts;

	describe('parse tests', () => {

		const samples = require('./parseSamples');

		try {
			parse(null);
		} catch (error) {
			it('expect wrong parse invocation throw', () => {
				expect(error).to.be.an
					.instanceof(errors
						.WRONG_MODIFICATION_PATTERN);
				expect(error).to.be.an
					.instanceof(Error);
			});
		}

		try {
			parse(Object.getPrototypeOf(user));
		} catch (error) {
			it('expect wrong parse invocation throw', () => {
				expect(error).to.be.an
					.instanceof(errors
						.WRONG_ARGUMENTS_USED);
				expect(error).to.be.an
					.instanceof(Error);
			});
		}
		try {
			parse(Object.getPrototypeOf(Object.getPrototypeOf(userPL1)));
		} catch (error) {
			it('expect wrong parse invocation throw', () => {
				expect(error).to.be.an
					.instanceof(errors
						.WRONG_ARGUMENTS_USED);
				expect(error).to.be.an
					.instanceof(Error);
			});
		}
		
		// debugger;
		const parsedUser = parse(user);
		const parsedUserTC = parse(userTC);

		const results = {
			parsedUser,
			parsedUserPL1: parse(userPL1),
			parsedUserPL2: parse(userPL2),

			parsedUserTC,
			parsedEvenMore: parse(evenMore),
		};

		it('expect proper first instance in chain constructor', () => {
			assert.equal(parsedUser.self[SymbolConstructorName], SymbolDefaultNamespace);
			assert.equal(parsedUser.parent.self[SymbolConstructorName], SymbolDefaultNamespace);
			assert.equal(parsedUserTC.self[SymbolConstructorName], SymbolDefaultNamespace);
			assert.equal(parsedUserTC.parent.self[SymbolConstructorName], SymbolDefaultNamespace);
		});

		it('should be ok with broken constructor chain', () => {

			const oneElseEmpty = new EmptyType();
			const oneElseEmptyProto = Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(oneElseEmpty)));

			expect(() => {
				oneElseEmptyProto[SymbolConstructorName] = undefined;
			}).to.throw;
			expect(() => {
				delete oneElseEmptyProto[SymbolConstructorName];
			}).to.throw;
		});

		let count = 0;
		const compare = (result, sample) => {
			Object.entries(result).forEach(entry => {
				const [name, value] = entry;
				const sampleValue = sample[name];

				if (name === 'parent') {
					return compare(value, sampleValue);
				}

				if (name === 'self') {
					it(`parse results should have same "self" with samples for ${name}`, () => {
						count++;
						assert.deepOwnInclude(value, sampleValue);
						assert.deepOwnInclude(sampleValue, value);
					});
					return;
				}
				if (name === 'proto') {
					it(`parse results should have same "proto" with samples for ${name}`, () => {
						count++;
						// assert.deepInclude(value, sampleValue);
						assert.deepInclude(sampleValue, value);
					});
					return;
				}

				it(`parse results should have same props with samples for "${name}"`, () => {
					count++;
					assert.deepEqual(value, sampleValue);
				});
			});
		};

		Object.keys(results).forEach(key => {
			compare(samples[key], results[key]);
		});

		it('should have exactly 60 amount of generated results~sample parse tests', () => {
			assert.equal(count, 60);
		});

	});

};

module.exports = test;
