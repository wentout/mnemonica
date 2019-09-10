# mnemonica
abstract technique that aids information retention : instance inheritance system

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![Travis (.org)](https://img.shields.io/travis/wentout/mnemonica)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)

;^)

```bash
npm i mnemonica
```

## core concept


```js
const { define } = require('mnemonica');

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

**How it Works then**

```js
const someTypeInstance = new SomeType({
	some   : 'arguments',
	data   : 'necessary',
	inside : 'of SomeType definition'
})
```

then :

```js

const someSubTypeInstance =
	someTypeInstance
		.SomeSubType({
			other  : 'data needed',
			inside : ' of ... etc ...'
		});

```

At this moment all stored data will inherit from `someTypeInstance` to `someSubTypeInstance`. Moreover, `someSubTypeInstance` become instanceof `SomeType` and `SomeSubType`.

## .extract()

Here, after all might be situation you need all props and  nested props collected with one object. You can use built-in `.extract()` method:

```js
const extracted = someSubTypeInstance.extract()
```

or

```js
const { extract } = require('mnemonica');
const extracted = extract(someSubTypeInstance);
```

Here `extracted` object will contain all iterable props of `someSubTypeInstance`. It means props are accessible via ` Symbol.iterator`. So, if you will define some hidden props, it will not consume them. This technique allows to concentrate only on meaningfull parts of [Data Flow Definition](https://en.wikipedia.org/wiki/Data-flow_diagram). So, all this might help to cover the gap between declared data flow and indeed flow written in code through describing flow itself with that simple way. For sure you are free to make your own `extract` functions on the top of acheived multiplie inherited data object (storage).