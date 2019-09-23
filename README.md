# mnemonica
abstract technique that aids information retention : instance inheritance system

---

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![Travis (.org)](https://img.shields.io/travis/wentout/mnemonica)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)

[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)

---

## core concept 

This lib might help us to create some sort of order or sequence or precedence of how we modify data inside of our code. It utilizes the concept of tree or [Trie](https://en.wikipedia.org/wiki/Trie) by combining both: Object Instances and Inheritance through the Prototype Chain. So we are able to inherit new instance from existing one as much times as we need. Sounds like obvious, but ... we tell about Instances, not about Classes, meaning Plain Objects, crafted from real Constructors before we start the process of inheriting them one from another.

Though, for sure we have to define some sort of Class for crafting our first Instance:


```js
const { define } = require('mnemonica');

const TypeModificatioConstructorFactory = () => {
	class SomeTypeConstructor {
		constructor (opts) {
			// all this definitions
			// just to show the example
			// of how it works
			const {
				some,
				data,
				// we will re-define
				// "inside" property later
				// using nested sub-type
				inside
			} = opts;
			this.some = some;
			this.data = data;
			this.inside = inside;
		}
	};
	return SomeTypeConstructor;
};

const SomeType = define(TypeModificatioConstructorFactory);
```

Or, we can define `SomeType` like this:

```js
const TypeModificatioConstructorFactory = () => {
	const SomeTypeConstructor = function (opts) {
		// as this is absolutely the same behaviour
		// we described upper
		// in TypeModificationProcedure
		// we allowed to do the following
		// for shortening this example lines
		Object.assign(this, opts);
	};
	// prototype definition is NOT obligatory
	SomeTypeConstructor.prototype
		.description = 'SomeType Constructor';

	return SomeTypeConstructor;
};

const SomeType = define(TypeModificatioConstructorFactory);
```

Or even like this:

```js

const TypeModificationProcedure = function (opts) {
	Object.assign(this, opts);
};

// prototype definition is NOT obligatory
const TypeModificationPrototypeProperties = {
	description : 'SomeType Constructor'
};

const SomeType = define('SomeTypeConstructor',
		TypeModificationProcedure,
			TypeModificationPrototypeProperties);
```

Then we can define some nested type, using our crafted `SomeType` definition:

```js
SomeType.define('SomeSubType', function (opts) {
	const {
		other,
		inside // again
	} = opts;
	this.other = other;
	// here we will re-define
	// our previously defined property
	// with the new value
	this.inside = inside;
}, {
	description : 'SomeSubType Constructor'
});
```

Now our type modification chain looks like this:

```js
// 1.
SomeType
	// 1.1
	.SomeSubType;
```

And we can continue nesting sub-types as far as it might be necessary for our code and our software architecture... :^)

## **How it Works then**

Let's create an instance, using `SomeType` construtor, we earlier.

```js
const someTypeInstance = new SomeType({
	some   : 'arguments',
	data   : 'necessary',
	inside : 'of SomeType definition'
});
```

Then, there might be situation, when we reached the place in code, where we have to use the next, nested -- `SomeSubType` -- constructor, to apply our `someTypeInstance` to the next one Inherited and **`Sub-Type'd`** Instance.

```js

const someSubTypeInstance =
	// someTypeInstance is an instance
	// we did before, through the referenced
	// SomeType constructor we made using
	// define at the first step
	// of this fabulous adventure
	someTypeInstance
		// we defined SomeSubType
		// as a nested constructor
		// so we have to use it
		// utilising  instance
		// crafted from it's parent
		.SomeSubType({
			other  : 'data needed',
			// and this is -re-definition
			// of "inside" property
			// as we promised before
			inside : ' of ... etc ...'
		});

```

At this moment all stored data will inherit from `someTypeInstance` to `someSubTypeInstance`. Moreover, `someSubTypeInstance` become instanceof `SomeType` and `SomeSubType` and, let's go deeper, instance of `someTypeInstance`.


And now let's ponder on our Instances:

```js

console.log(someTypeInstance);

	some   : 'arguments'
	data   : 'necessary'
	inside : 'of SomeType definition'

console.log(someSubTypeInstance);

	other  : 'data needed'
	inside : ' of ... etc ...'

```

So, here it might be looking miscouraging... but this is not the end of the story, cause we have the magic of **built-in** ...

# .extract()

So, here is a situation we need all previously defined props and all the nested props collected to the one-same object:

```js

const extracted = someSubTypeInstance.extract();

console.log(extracted);

	data        : "necessary"
	description : "SomeSubType Constructor"
	inside      : " of ... etc ..."
	other       : "data needed"
	some        : "arguments"

```

or, with the same behaviour:

```js
const { extract } = require('mnemonica').utils;
const extracted = extract(someSubTypeInstance);

	data        : "necessary"
	description : "SomeSubType Constructor"
	inside      : " of ... etc ..."
	other       : "data needed"
	some        : "arguments"

console.log(extract(someTypeInstance));

	data        : "necessary"
	description : "SomeType Constructor"
	inside      : "of SomeType definition"
	some        : "arguments"

```

Here `extracted` object will contain all iterable props of `someSubTypeInstance`. It means props are accessible via `Symbol.iterator`. So if you will define some hidden props, it will not consume them. This technique allows us acheive concentration only on meaningfull parts of [Data Flow Definition](https://en.wikipedia.org/wiki/Data-flow_diagram). So, all this might help to cover the gap between declared data flow and indeed flow written in code through describing flow itself with that simple way. For sure you are free to make your own `.extractor()` functions on the top of acheived multiplie inherited data object (storage):

![Inheritance of someSubTypeInstance](./test/doc.example.png)

And back to definitions, for sure, all of the following is true:

```js

console.log(someTypeInstance instanceof SomeType); // true
console.log(someSubTypeInstance instanceof SomeType); // true
console.log(someSubTypeInstance instanceof SomeSubType); // true
// who there can care... but, yes, it is again: true
console.log(someSubTypeInstance instanceof someTypeInstance);

```

But this is not the end... it might be discouraging, but this is only the begining.

## How do we use defined "mnemonicas"

Suppose we have to handle the `request.data` somewhere in our code and we have to consume it someelsewhere. Let's imagine us inside of **[ETL process](https://en.wikipedia.org/wiki/Extract,_transform,_load)**.

Let's create Constructor for this sort of data.

```js
const RequestDataTypeModificator = 
	define('RequestData',
		FactoryOfRequestHandlerCostructor);
```

Then we will use it in our code like this:

```js
(req, res) => {
	const requestInstance = 
		RequestDataTypeModificator(req.body);
};
```

And then it might be necessary to jump to the next part of code, which cooperate with some Storage or Daba Base.

```js
const GoneToTheDataBase = 
	RequestDataTypeModificator.
		// jumped data definition
		define('GoneToTheDataBase',
			DataBaseRequestHandlerCostructor);
```

So, now we might choose what to do: inspect some collected data or probably we wish to extract it for **tests** or, moreover for **log** or even grab them with the other consumer. And yes, we already saw `.extract()` method, but there are also two other methods could be much more helpfull...

# Pre & Post creation Hooks

```js
// callback will be called Before requestInstance creation

const preCreationCallback = (hookData) => {
	const {
		
		// { string }
		TypeModificatorName,
		
		// 1. [ array ]
		// ...args of TypeModificator
		// for instance creation
		argumentsOfTypeModificator,
		
		// 2. { object }
		// instance we will craft from
		// using our TypeModificator
		instanceUsedForInheritance
		
	} = hookData;
	// some necessary pre-investigations
};

RequestDataTypeModificator
	.registerHook(
		'preCreation', 
			preCreationCallback);


const postCreationCallback = (hookData) => {
	const {
		// { string }
		TypeModificatorName,
		
		// 1. [ array ]
		argumentsOfTypeModificator,
		
		// 2. { object }
		instanceUsedForInheritance,
		
		// 3. { object }
		// instance we just crafted
		// from instanceUsedForInheritance
		// using our TypeModificator
		// with argumentsOfTypeModificator
		// and ... inheritedInstance
		//  .constructor.name is 
		// 'TypeModificatorName'
		inheritedInstance
		
	} = hookData;
	// some necessary post-investigations
};

// callback will be called After requestInstance creation
RequestDataTypeModificator
	.registerHook(
		'postCreation', 
			postCreationCallback);
```

Thouse hooks will be proceeded if you register them... for each instance you will craft using `RequestDataTypeModificator`. So if you wish to investigate instances of `GoneToTheDataBase` type modificator then you have to register the other hooks for it:

```js

GoneToTheDataBase
	.registerHook(
		'preCreation', // ...
		
GoneToTheDataBase
	.registerHook(
		'postCreation', // ...
	

```

For sure registering hooks for each defined type is boring, so now we see we have to use Namespaces for Instances.

# Namespaces

By default `define` utilise services of Default Namespace which is always hidden, but always exist. You can lend them using the following technique:

```js

const {
	namespaces,
	SymbolDefaultNamespace
} = require('mnemonica');

const defaultNamespace = namespaces.get(SymbolDefaultNamespace);

```

**Silly joke, isn't it?** ... sure, you can just use:

```js

const {
	defaultNamespace
} = require('mnemonica');

```

And here you can play much more joyfull play with hooks:

```js

defaultNamespace
	.registerHook(
		'preCreation', preCreationNamespaceCallback);
		
defaultNamespace
	.registerHook(
		'postCreation', postCreationNamespaceCallback);

```

So, now all instances crafted from this namespace will call that hooks. The difference between hooks defined using type modificator and hooks defined using namespace is in the following execution order of hooks invocations:

```js

// 1.
namespace.invokeHook('preCreation', // ...

// 2.
type.invokeHook('preCreation', // ...

// 3. instance creation is here

// 4.
type.invokeHook('postCreation', // ...

// 5.
namespace.invokeHook('postCreation', // ...

```

It is important, yes, but not as much as we can expect... because of ... nevermind. 

Finally, you can craft your own namespaces:

```js

const {
	createNamespace
} = require('mnemonica');

const anotherNamespace =
	createNamespace('Another Namespace Name');

```

And there also is one important thing. For example you have to build type modificator with the same name. You can do this, because you can craft as much types modificators collecttions, as you need. Even inside of the same namespace:

```js

const {
	createTypesCollection
} = require('mnemonica');

const otherOneTypesCollectionOfDefaultNamespace = 
	createTypesCollection(defaultNamespace);

const defineOfAnother = 
	otherOneTypesCollectionOfDefaultNamespace
		// another define method -> another ref
		.define;

const anotherTypesCollectionOfAnotherNamespace = 
	createTypesCollection(anotherNamespace);

const defineOfAnotherAnother = 
	anotherTypesCollectionOfAnotherNamespace
		// and another define method -> another ref
		.define;

```

And even more. You can use Hooks with Types Collections also (starting from v0.3.1). Fore doing this just grab referer to collection somewhere, for example:


```js
const {
	defaultTypes
} = require('mnemonica');

defaultTypes
	.registerHook(
		'preCreation', preCreationTypesCollectionCallback);
		
defaultTypes
	.registerHook(
		'postCreation', postCreationTypesCollectionCallback);


```

'Pre' hooks for Types Collections invoked after Namespace Hooks invocation, but before Type Hook invocation. 'Post' hooks for Types Collections invoked after Namespace Type Hook invocation, but before Namespace Hooks invocation. So, actually it looks like:

```js

// 1.
namespace.invokeHook('preCreation', // ...

// 2.
typecollection.invokeHook('preCreation', // ...

// 3.
type.invokeHook('preCreation', // ...

// 4. instance creation is here

// 5.
type.invokeHook('postCreation', // ...

// 6.
typecollection.invokeHook('postCreation', // ...

// 7.
namespace.invokeHook('postCreation', // ...

```


---
# finally

So, now you can craft as much types as you wish, combine them, re-define them and spend much more time playing with them:


* test : instances & arguments
* track : moments of creation
* check : if the order of creation is OK
* validate : everything, 4 example use sort of TS in runtime
* and even .parse them using `mnemonica.utils.parse`:

![Inheritance of someSubTypeInstance](./test/doc.example.parse.png)

Good Luck!