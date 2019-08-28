module.exports = {
	"env": {
		"node": true,
		"es6": true,
		'mocha': true,
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 2017
	},
	"plugins" : [
		"mocha"
	],
	"rules": {
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"single"
		],
		"semi": [
			"error",
			"always"
		],
		"no-unused-vars": "warn",
		"no-console": "off",
		"no-debugger": "off"
	}
};