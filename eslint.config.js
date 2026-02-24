const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');
const mocha = require('eslint-plugin-mocha');
const noArrowThis = require('eslint-plugin-no-arrow-this');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');

const commonRules = {
	'indent': ['error', 'tab'],
	'key-spacing': ['warn', {
		beforeColon: true,
		afterColon: true,
		align: 'colon',
	}],
	'linebreak-style': ['error', 'unix'],
	'quotes': ['error', 'single'],
	'semi': ['error', 'always'],
	'no-unused-vars': 'off',
	'@typescript-eslint/no-unused-vars': 'error',
	'no-shadow': ['error', {
		builtinGlobals: true,
		hoist: 'all',
		allow: ['this'],
	}],
	'array-bracket-spacing': ['error', 'always'],
	'computed-property-spacing': ['error', 'always'],
	'object-curly-spacing': ['error', 'always'],
	'space-before-function-paren': ['error', {
		'anonymous': 'always',
		'named': 'always',
		'asyncArrow': 'always',
	}],
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
	'func-name-matching': 'error',
	'line-comment-position': ['warn', {
		position: 'above',
	}],
	'@typescript-eslint/no-var-requires': 'off',
	'@typescript-eslint/no-empty-function': 'off',
	'@typescript-eslint/no-explicit-any': 'off',
	'@typescript-eslint/no-require-imports': 'off',
	'new-cap': 'off',
	'yoda': 'warn',
};

const commonLanguageOptions = {
	parser: tsParser,
	globals: {
		...globals.node,
		...globals.mocha,
	},
	ecmaVersion: 2018,
	sourceType: 'module',
};

const commonPlugins = {
	mocha,
	'no-arrow-this': noArrowThis,
	'@typescript-eslint': typescriptEslint,
};

module.exports = [
	// Config for src directory
	{
		files: ['src/**/*.{js,ts}'],
		languageOptions: commonLanguageOptions,
		plugins: commonPlugins,
		rules: commonRules,
	},
	// Config for test directory
	{
		files: ['test/**/*.{js,ts}'],
		languageOptions: commonLanguageOptions,
		plugins: commonPlugins,
		rules: commonRules,
	},
	// Config for build directory (relaxed rules)
	{
		files: ['build/**/*.js'],
		languageOptions: commonLanguageOptions,
		plugins: commonPlugins,
		rules: {
			...commonRules,
			'no-multi-assign': 0,
			'@typescript-eslint/no-this-alias': 0,
			'prefer-destructuring': 0,
			'new-cap': 0,
		},
	},
	// Global ignores
	{
		ignores: [
			'test/example.js',
			'test/decorate.js',
			'test-ts/**',
			'test-jest/**',
			'build/**',
			'node_modules/**',
			'.eslintrc.js',
			'eslint.config.js',
		],
	},
];
