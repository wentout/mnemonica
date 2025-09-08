'use strict';

const { assert, expect } = require('chai');

const {
	getProps,
} = require( '..' );

const tests = (opts) => {
	const {
		evenMore,
		ThrowTypeError
	} = opts;
	describe('uncaughtException test', () => {
		it('should throw proper error', (passedCb) => {
			const throwArgs = {
				uncaughtException : true
			};

			setTimeout(() => {

				process.removeAllListeners('uncaughtException');

				const onUncaughtException = function (error) {
					assert.equal(
						getProps(error).__args__[ 0 ],
						throwArgs
					);
					expect(error).instanceOf(Error);
					expect(error).instanceOf(TypeError);
					expect(error).instanceOf(ThrowTypeError);
					expect(Object.hasOwnProperty.call(error, 'stack'), true);
					// debugger;
					console.log(error.stack);
					passedCb();
				};

				process.on('uncaughtException', onUncaughtException);
				new evenMore.ThrowTypeError(throwArgs);

			}, 100);
		});
	});
};

module.exports = tests;
