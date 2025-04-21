module.exports = {
	preset          : 'ts-jest',
	testEnvironment : 'node',
	testMatch       : [ '**/test-jest/**/*.ts' ],
	transform       : {
		'\\./test-jest/*.ts$' : [ 'ts-jest', { tsconfig : './tsconfig.jest.json' } ]
	},
	coverageDirectory : './coveragejest'
};