module.exports = {
	'env': {
		'node': true,
		'es6': true,
		'mocha': true,
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'plugins' : [
		'mocha',
		'eslint-plugin-no-arrow-this'
	],
	'rules': {
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-unused-vars': 'warn',
		'no-shadow' : [
			'error', {
				'builtinGlobals' : true,
				'hoist' : 'all',
				'allow' : []
			}
		],
		'prefer-template': 'warn',
		'prefer-spread': 'warn',
		'no-useless-concat': 'warn',
		'prefer-rest-params': 'warn',
		'prefer-destructuring': 'warn',
		'no-useless-computed-key' : 'warn',
		'no-useless-constructor' : 'warn',
		'no-useless-rename' : 'warn',
		'no-this-before-super' : 'warn',
		'no-new-symbol' : 'warn',
		'no-duplicate-imports' : 'warn',
		'no-confusing-arrow' : 'warn',
		'no-multi-assign' : 'warn',
		'no-lonely-if' : 'warn',
		'newline-per-chained-call' : 'warn',
		'new-cap' : 'warn',
		'func-name-matching' : 'error',
		'consistent-this' : 'error',
		'line-comment-position' : [
			'warn', {
				position : 'above'
			}
		],
		'quotes': [
			'error', 'single'
		],
		'no-arrow-this/no-arrow-this': [
			'warn', {
				onlyGlobals : true
			}
		],
		'yoda': 'warn'
	}
};