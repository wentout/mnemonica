# mnemonica
abstract technique that aids information retention : instance inheritance system

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![Travis (.org)](https://img.shields.io/travis/wentout/mnemonica)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)

;^)

```js
const SomeType = define('TypeName', TypeModificatorConstructor);
```

or

```js
const SomeType = define('TypeName',
	TypeModificatorFunction, TypeModificatorFunctionPrototype);
```

then :

```js
SomeType.define('SomeSubType`, SubType);  // ... etc
```

so now it looks like this

```js
SomeType
		.SomeSubType
```

And we can continue;

**How it then Works**

```js
const someTypeInstance = new SomeType({
	some   : 'arguments',
	data   : 'necessary',
	inside : 'of SomeType definition'
})
```

then :

```js

const someSubTypeInstance = someTypeInstance
	.SomeSubType({
		other  : 'data needed',
		inside : ' of ... etc ...'
	});

```