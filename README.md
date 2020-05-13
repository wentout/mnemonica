# mnemonica is
abstract technique that aids information retention : instance inheritance system

... allows us to make inherited descriptions of mappings of transformations from predecessor structured data types to the successors, as if it was math `f(x)=>y` ... and we will use `this` keyword as a persistent data structure where we will apply that transformations

---

# shortcuts

* ?. : state : **mad science**
* ?. : type : **asynchronous monad descriptor** => this
* ?. : prod ready : **we wonder about**
* ?. : typescript : **yes, some, starting from 0.9.753**
* ?. : example : **git clone && npm run example**

---

[![Coverage Status](https://coveralls.io/repos/github/wentout/mnemonica/badge.svg?branch=master)](https://coveralls.io/github/wentout/mnemonica?branch=master)
![Travis (.org)](https://img.shields.io/travis/wentout/mnemonica)
![NPM](https://img.shields.io/npm/l/mnemonica)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wentout/mnemonica)
![GitHub last commit](https://img.shields.io/github/last-commit/wentout/mnemonica)

[![NPM](https://nodei.co/npm/mnemonica.png?mini=true)](https://www.npmjs.com/package/mnemonica)



---

# core concept

This lib might help to create some sort of order or sequence or precedence of how we modify data inside of our code. It utilizes the concept of tree or [Trie](https://en.wikipedia.org/wiki/Trie) by combining both: Object Instances and Inheritance through the Prototype Chain, where we are able to create new instance inherited from existing one as much times as we need. It might look like obvious, but ... we tell about Instances, not about Classes, meaning Plain Objects, crafted from real Constructors before we start the process of inheriting them one from another. In an attempt to describe this approach let me suggest this articles:

* [Inheritance in JavaScript : Factory of Constructors with Prototype Chain](https://github.com/mythographica/stash/blob/master/inheritance.md)
* [Architecture of Prototype Inheritance in JavaScript](https://dev.to/wentout/architecture-of-prototype-inheritance-in-javascript-ce6)
* [Dead Simple type checker for JavaScript](https://dev.to/wentout/dead-simple-type-checker-for-javascript-4l40)


## Factory of Constructors

As we discrovered from that article, we need some tooling, giving us the best experience with Prototype Chain Inheritance pattern. First of all it must be reproducible and maintainable. And from the first point we have to define some sort of Factory Constructor for start crafting our Instances, it might look like so:

```js
const { define } = require('mnemonica');

const TypeModificationProcedure = function (opts) {
	Object.assign(this, opts);
};

// prototype definition is NOT obligatory
const TypeModificationPrototypeProperties = {
	description : 'SomeType Constructor'
};

// SomeTypeConstructor -- is a constructor.name
const SomeType = define('SomeTypeConstructor',
		TypeModificationProcedure,
			TypeModificationPrototypeProperties);

```

Or, we can define `SomeType` like this:

```js
const TypeModificationConstructorFactory = () => {
	// SomeTypeConstructor -- is a constructor.name
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

const SomeType = define(TypeModificationConstructorFactory);
```

Or using Classes:

```js
const TypeModificationConstructorFactory = () => {
	// SomeTypeConstructor -- is a constructor.name
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

const SomeType = define(TypeModificationConstructorFactory);
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

// or, absolutely equal
SomeType.SomeSubType = function (opts) {
	const {
		other,
		inside // again
	} = opts;
	this.other = other;
	// here we will re-define
	// our previously defined property
	// with the new value
	this.inside = inside;
};
SomeType.SomeSubType.prototype = {
	description : 'SomeSubType Constructor'
};
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

![Inheritance of someSubTypeInstance](https://raw.githubusercontent.com/mythographica/stash/master/img/doc.example.png)

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

Here we might choose what to do: inspect some collected data or probably we wish to extract it for **tests** or **log** or even grab them with the other consumer. And yes, we already saw `.extract()` method, but there are also two other methods could be much more helpfull...

# Pre & Post creation Hooks

```js
// callback will be called Before requestInstance creation

const preCreationCallback = (hookData) => {
	const {
		
		// { string }
		TypeName : TypeModificatorConstructor.name,
		
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
		TypeName : TypeModificatorConstructor.name,
		
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
		// TypeName
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

And even more. You can use Hooks with Types Collections also (starting from v0.3.1). For doing this just grab referer to collection somewhere, for example:


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

As we can see, type hooks are closest one to the type itself. For sure, there can be situations, when you have to register some common hooks, but not for `typecollection` or `namespace`. Assume you have some friendly types, might be from different collections, and you have to register the same hooks definitions for them. And the plase where you wish to do this is the file, other than files you defined that types. There you can use:

# .lookup('TypeName')

```js
const {
	lookup
} = require('mnemonica');

const SomeType = lookup('SomeType');
const SomeNestedType = lookup('SomeType.SomeNestedType');

```

And now it is not so necessary easy to explain why it could be usefull to use nested definitions. Sure you can do them by using the following technique: 

```js

define('SomeExistentType.SomeExistentNestedType.NewType', function () {
	// operators
});

// or from tm descriptor
// if you have reference
SomeExistentType.define('SomeExistentNestedType.NewType', function () {
	// operators
});

// you can also use

SomeExistentType.define('SomeExistentNestedType', () => {
	// name of "NewType" is here
	// nested inside of delcaration
	return class NewType {
		constructor (str) {
			// operators
		}
	};
});

```

# .parent('TypeName')

Let assume our `instance` has indeed deep prototype chain:

```js
EvenMore
	.MoreOver
		.OverMore
			// ...
			// ...
			.InitialType
```

And we wish to get reference to one of the prececessors, though we have only reference to insance itself. Here we can use builtin `instance.parent()` method:

```js

// fisrst parent
// simply equal to instance.__parent__
const parent = instance.parent();

// deep parent from chain
const parent = instance
	.parent( 'DeepParentName' );

```


# SomeType.call ( this_obj, ...args)
You can combine existing TypeConstructor with any instance, even with Singletones:

```js
const usingProcessAsProto = Singletoned.call(process, {
	some   : 'arguments',
	data   : 'necessary',
	inside : 'for definition'
});
console.log(typeof instanceUsingProcessSingletone.on) // function
```

or you can combine with window, or document or...

```js

const usingWindowAsProto = Windowed.call(window);
const usingDocumentAsProto = Documented.call(document);
const usingJQueryAsProto = JQueried.call(jQuery);

// or even ReactDOM
import ReactDOM from "react-dom";
import { define } from "mnemonica";
const ReactDOOMed = define("ReactDOOMed", function() {});
const usingReactAsProto = ReactDOOMed.call(ReactDOM);

const root = document.getElementById("root");
usingReactAsProto.render("just works", root);

```

# Asynchronous Constructors
First of all you should understand what you wish to are doing!
Then you should understand what you wish. And only after doing so you might use this technic:

```js
const AsyncType = define('AsyncType', async function (data) {
	return Object.assign(this, {
		data
	});
});

const asyncCall = async function () {
	const asyncConstructedInstance = await new AsyncType('tada');
	console.log(asyncConstructedInstance) // { data: "tada" }
	console.log(asyncConstructedInstance instanceof AsyncType) // true
};

asyncCall();
```

Also nothing will warn you from doing this for SubTypes:

```js
const NestedAsyncType = AsyncType
	.define('NestedAsyncType',async function (data) {
		return Object.assign(this, {
			data
		});
	}, {
		description: 'async of nested'
	});

const nestedAsyncTypeInstance = await new 
	asyncConstructedInstance.NestedAsyncType('boom');

console.log(nestedAsyncTypeInstance instanceof AsyncType) // true
console.log(nestedAsyncTypeInstance instanceof NestedAsyncType) // true
console.log(nestedAsyncTypeInstance.description); // 'async of nested'
```

Also for the first instance in chain you can do for example inherit from singletone:

```js
const asyncCalledInstance = await AsyncType
	.call(process, 'wat');
// or
const asyncCalledInstance = await AsyncType
	.apply(process, ['wat']);
console.log(asyncCalledInstance) // { data: "wat" }
console.log(asyncCalledInstance instanceof AsyncType) // true
```

# Asynch Chain & single await

Let for example suppose you need the following code:

```js
async (req, res) => {
	
	const {
		email    // : 'async@check.mail',
		password // : 'some password'
	} = req.body

	const user = await
		new UserTypeConstructor({
			email,
			password
		})
		.UserEntityValidate('valid sign') // sync
		.WithoutPassword() // sync, rid of password
	
	const storagePushResult =
		await user.AsyncPushToStorage();
	const storageGetResult =
		await storagePushResult.AsyncGetStorageResponse();
	const storageValidateResult =
		storagePushResult.SyncValidateStorageData()
	const requestRplyResult = 
		await StorageValidateResult.AsyncReplyToRequest(res);
	return requestRplyResult;
};
```

Here we have a lot of unnecessary variables. Though we can combine our chain using `.then()` or simpy brakets `(await ...)`, but it will definetely looks weird:

```js
async (req, res) => {
	
	const {
		email,    // : 'async@check.mail',
		password // : 'some password'
	} = req.body

	const user =
		await (
			  (
		await (
		await (
			new UserTypeConstructor({
				email,
				password
			})
			.UserEntityValidate('valid sign')
			.WithoutPassword()
		).AsyncPushToStorage()
		).AsyncGetStorageResponse()
		).SyncValidateStorageData()
		).AsyncReplyToRequest(res);
};
```

And with using `.then()` of general promises it will look much more badly, even over than "callback hell".

And, if so, starting from `v.0.5.8` we are able to use async chains for async constructors:

```js
async (req, res) => {
	
	const {
		email,    // : 'async@check.mail',
		password // : 'some password'
	} = req.body

	const user =
		await new UserTypeConstructor({
				email,
				password
			})
			.UserEntityValidate('valid sign')
			.WithoutPassword()
			.AsyncPushToStorage()
			.AsyncGetStorageResponse()
			.SyncValidateStorageData()
			.AsyncReplyToRequest(res);
};
```
So now you don't have to care if this constructor is async or sync and where to put brakets and how many of them. It is enough to type constructor name after the dot and pass necessary arguments. That's it.

## require('util').callbackify

It is important: if we make `util.callbackify` from our instance async creation method, we shall [`.call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/call) it then.



# Instance Properties

Also starting from `v0.3.8` the following non enumerable props are availiable from instance itself (`instance.hasOwnProperty(__prop__)`):

## `.__args__`

Arguments, used for calling instance creation constructor.

## `.__type__`
The definition of instance type.

## `.__parent__`
If instance is nested, then it is a reference of it's parent.

## `.__subtypes__`
What you can craft from this instance accordingly with it's defined Type, the same as `__type__.subtypes`.

## `.__collection__`
Collection of types where `__type__` was defined.

## `.__namespace__`
Namespace where `__collection__` was defined.


# `instance.clone`
Returns cloned instance, with the following condition `instance !== instance.clone`. Cloning includes all the inheritance, with hooks invocations and so on. Therfore cloned instance is not the same as instance, but both made from the same `.__parent__` instance.

_Note_: if you are cloning instance, which has `async Constructor`, you should `await` it;


# **`instance.fork( some, new, args )`**
Returns forked instance. Behaviour is same as for cloned instance, both made from the same `.__parent__`. But this is a method, not the property, so you can apply another arguments to the constructor.

_Note_: if you are forking instance, which has `async Constructor`, you should `await` it;


# Directed Acyclic Graphs

## **`instance.fork.call( thisArg, ...args )`**
## **`instance.fork.apply( thisArg, [args] )`**
Let assume you nedd [Directed Acyclic Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph). Then you have to be able to construct it somehow. Starting from `v0.6.1` you can use `fork.call` or `fork.apply` for doing this:

```js
// the following equals
A.fork.call(B, ...args);
A.fork.apply(B, [args]);
A.fork.bind(B)(...args);
```
_Note_: if you are `fork.clone`'ing instance, which has `async Constructor`, you should `await` it;


## mnemonica.utils.merge(A, B, ...args)
The same as `fork.call` but providing instsnces directly.

_Note_: if you are `merge`'ing instances, where A.constructor is `async Constructor`, you should `await` it;

---

# ESM Support
Starting from v0.6.8 you can try to import ESM using the following scenario:

```js
import { define, lookup } from 'mnemonica/module';
```

# finally

So, now you can craft as much types as you wish, combine them, re-define them and spend much more time playing with them:


* test : instances & arguments
* track : moments of creation
* check : if the order of creation is OK
* validate : everything, 4 example use sort of TS in runtime
* and even .parse them using `mnemonica.utils.parse`:

![Inheritance of someSubTypeInstance](https://raw.githubusercontent.com/mythographica/stash/master/img/doc.example.parse.png)

Good Luck!
