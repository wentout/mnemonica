module.exports = {
	preset          : 'ts-jest',
	testEnvironment : 'node',
	testMatch       : [ '**/test-jest/index.ts' ],
	transform       : {
		'^.+\\.ts$' : [ 'ts-jest', { 
			tsconfig : './tsconfig.jest.json',
			isolatedModules : true
		} ]
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
	// collectCoverage: true,
	// coverageReporters: ['lcov', 'text', 'html'],
};
