module.exports = {
	parser: "@typescript-eslint/parser",
	env: {
		node: true,
		es6: true,
		mocha: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	plugins: [
		'mocha',
		'eslint-plugin-no-arrow-this',
		'@typescript-eslint'
	],
	rules: {
		'indent': ['error', 'tab'],
		'key-spacing': [
			'warn',
			{
				beforeColon: true,
				afterColon: true,
				align: 'colon',
			},
		],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'error',
		'no-shadow': [
			'error',
			{
				builtinGlobals: true,
				hoist: 'all',
				allow: [],
			},
		],
		'array-bracket-spacing': ['error', 'always'],
		'computed-property-spacing': ['error', 'always'],
		'object-curly-spacing': ['error', 'always'],
		'space-before-function-paren': [
			'error', {
				'anonymous': 'always',
				'named': 'always',
				'asyncArrow': 'always'
			}
		],
		'prefer-template': 'warn',
		'prefer-spread': 'warn',
		'no-useless-concat': 'warn',
		'prefer-rest-params': 'warn',
		'prefer-destructuring': 'warn',
		'no-useless-computed-key': 'warn',
		'no-useless-constructor': 'warn',
		'no-useless-rename': 'warn',
		'no-this-before-super': 'warn',
		'no-new-symbol': 'warn',
		'no-duplicate-imports': 'warn',
		'no-confusing-arrow': 'warn',
		'no-multi-assign': 'warn',
		'no-lonely-if': 'warn',
		'newline-per-chained-call': 'warn',
		'new-cap': 'warn',
		'func-name-matching': 'error',
		// 'consistent-this' : 'error',
		'line-comment-position': [
			'warn',
			{
				position: 'above',
			},
		],
		'no-arrow-this/no-arrow-this': [
			'error',
			{
				onlyGlobals: true,
			},
		],
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		yoda: 'warn',
	},
	overrides: [{
		files: ['build/**/*.js'],
		rules: {
			'no-multi-assign': 0,
			'prefer-destructuring': 0,
			'new-cap': 0
		}
	}]
};
