module.exports = {
	preset          : 'ts-jest',
	testEnvironment : 'node',
	testMatch       : [ '**/test-jest/index.ts' ],
	transform       : {
		'\\./test-jest/*.ts$' : [ 'ts-jest', { tsconfig : './tsconfig.jest.json' } ]
	},
	coverageDirectory   : './coveragejest',
	collectCoverageFrom : [
		'src/**/*.ts',
		'!src/**/*.d.ts',
	],
	coverageThreshold : {
		global : {
			statements : 100,
			branches   : 100,
			functions  : 100,
			lines      : 100,
		},
	},
};
