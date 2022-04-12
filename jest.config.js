module.exports = {
	preset          : 'ts-jest',
	testEnvironment : 'node',
	testMatch       : ['**/testjest/**/*.ts'],
	globals         : {
		'ts-jest' : {
			tsconfig : './testjest/tsconfig.json'
		}
	},
	coverageDirectory : './coveragejest'
};