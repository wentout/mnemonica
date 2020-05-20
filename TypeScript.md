
# Mnemonica TypeScript Explanations

## (default) way to go with typings

So, getting from the README.md as a starting point, the main method of the library is `.define`, here is how it works:

```js

	import { define } from 'mnemonica';

	// TypeClass
	const TypeClass = define('TypeClass', function (opts) {
		// any operators here, for example
		Object.assign(this, opts);
	});

	const typeClassInstance = new TypeClass();

```

And `.define` it is indeed have to typed. And there is almost no way somebody would be glad reading it's interface if it would. Therefore it just checks that provided constructor function is `:NewableFunction` and provided typename is `:string`. The rest of typing is on your own. You can mark `TypeClass` or `typeClassInstance` with necessary type you wish, and you can pass `this` definition argument to newable function. Combining all three you will get all necessary typings.


```js

	import { define } from 'mnemonica';
	
	type SomeType = {
		// some definitions
		...
		// defined in future
		NestedType: NewableFunction
	};
	
	type Nesteds = {
		define: CallableFunction
	};
	
	// TypeClass
	const TypeClass:Nesteds = define('TypeClass', function (this:SomeType, opts) {
		// any operators here, for example
		Object.assign(this, opts);
	});

	const typeClassInstance:SomeType = new TypeClass();
	
	const NestedClass = TypeClass.define('NestedType', function () { /* ... */});
	
	const nestedType:SomeType = new typeClassInstance.NestedType();
	

```

## (default) future compatibility

For future compatibility it is better to **default**. It might be possible there would be TypeScript compatibility to cover all code in future and we will be able to provide all the necessary things. Therefore it wouldn't be necessary to get rid of already written proper typings of your code.

## the other way

And yes, it works like this for us, if we wish to get reach to the typings right now, as you see there is a lot of changes:

```js
	'use strict';

	import { tsdefine, IDEF } from 'mnemonica';

	type SomeTypeInstance = {
		someField: string;
		// defined in future
		SomeSubType: IDEF<SubTypeInstance>;
	}

	interface SubTypeInstance extends SomeTypeInstance {
		two?: string;
	}

	const SomeType = tsdefine( 'SomeType', function () {
		this.someField = 'some field data'; // ts OK
		this.someField = 123; // ts error wrong casting
		this.q = 123; // ts error no field

	} as IDEF<SomeTypeInstance> );

	SomeType.define( 'SomeSubType', function () {
		this.two = 'other field'; // ts OK
	} as IDEF<SubTypeInstance> );

	const someTypeInstance = new SomeType();
	someTypeInstance.someField = 'Re Writing of someField'; // ts OK
	someTypeInstance.someField = 123; // ts error wrong casting
	someTypeInstance.q = 123; // ts error no field

	const second = new someTypeInstance.SomeSubType();
	second.two = 123; // ts error wrong casting

```

This example is not so easy. As you see we if we go deeper with the purpose of mnemonica, we have to craft a lot of additional tooling per each step.

And seems there is no way to make the other 99% cause of TypeScript limitations. Therefore `tsdefine` method is extremely hard to passthrough without types. And if you are TypeScript developer, emm... **Please Help Me!**

The other way is `tsdefine` instead of `.define` provides the same typechecks as you can do with **(default)** way. And you would need to annotate a lot of other things instead of annotating the results. There where `.define` is just a way to go as you wish and as you go, `tsdefine` enforces you to make a lot of hard stuff. 

Moreover, if the default way would win, the support of `tsdefine` might be excluded from library, as it would be not so necessary anymore, though we think to leave it for backward compatibility.

# The Truth is...

About the plans. Indeed, as we can see from code there Should be no typings at all, it Must be the same as JavaSript code, but with type checker. And the goal is to make the following:

* extract `typeof this` from newable function or class provided to `.define`
* give `this` as some sort of result for `new TypeClass()`, so the type of `typeClassInstance` magically casts with `typeof this` inside of `TypeClass` constructor
* get `'SomeSubType'` string somehow and add it to the result of `new TypeClass()` as mnemonica does through hidden mechanics, so there is a way to make `new instance.SomeSubType()` with automated typecheck, derived from previous step of consruction trie (from prototype).

If this plans are reachable, there would be no necessity to provide any typings at all, everything would be automatically covered. My hope it would be possible. If not, ehh... ok, I would pick JavaScript, because the tooling I can craft is much more important than typechecks I should provide.

And it seems there might be two probable situations: it is completely impossible to extract typings or just I have to visit specialist. I spent a lot of time in an attempt to fix this, and it is about 1% of success. Thought at least we are able to provide some typings now, and it is is ok, but the true power of mnemonica is hidden.

Chaining with TypeClass provides a lot of features:
* **straight** viable steps of application **lifecycle** via described steps of construction chain for each instance
* the ability to make `.clone` or `.fork` and even re-write or re-initialize the constructor
* powerfull `Error`'s checking with automated ability to get `instanceof FailedConstructor` check which is written above `Error` instance
* testing simplicity because each constructor is a separate clean function, it is easy to write unit tests
* mnemonica collections are is a sort of DI container, you can extract, mock and so on, as you wish
* * chained asynchronous constructors are good also, grep for `await new` of the `./test` folder
* everything is connected, therefore we indeed write much less code

And if this all is not enough, there is overwhelming power of `.registerHook`, which provides the ability to get reach to :

* answer the question where each tiny piece of running code it belongs to... through combination of `auto-bind` and `async_hooks` module.
* easy monitoring of each construction step, written once
* powerful validations based on `'preCreation'` and `'postCreation'` hooks

Just imagine... having all this power you are switching to TypeScript and there is no way to get the power back... what would you choose ?

Therefore I chosed life in real world.
Making the JavaScript part of code better and better and will be able to concentrate on things I indeed care of, and I will try to write it with TS files if I can.

And TypeScript typings support, emm... if you wish play with types -- it is not my choice, but yours. I gave the ability to describe types and will accept PRs. That is why I'm asking for Help with TypeScript typings...

So, the Truth is... it is time for joke... that [Prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) is Asynchronous [Set](https://en.wikipedia.org/wiki/Set_theory) of [Linearizable](https://en.wikipedia.org/wiki/Linearizability) [Dependent](https://en.wikipedia.org/wiki/Dependent_type) [Refinement](https://en.wikipedia.org/wiki/Refinement_type) of [Bounded quantification](https://en.wikipedia.org/wiki/Bounded_quantification) based on [History monoid](https://en.wikipedia.org/wiki/History_monoid) solving [Expression problem](https://en.wikipedia.org/wiki/Expression_problem) through [Chaining](https://en.wikipedia.org/wiki/Method_chaining) of [Type Classes](https://en.wikipedia.org/wiki/Type_class) by [Multimethods](https://en.wikipedia.org/wiki/Multiple_dispatch)... and might be I missed something else... for example [Trace](https://en.wikipedia.org/wiki/Trace_theory) and [HoTT](https://en.wikipedia.org/wiki/Homotopy_type_theory)...

# Thank YOU ;^)
## best wishes
### all in good time

