'use strict';

// Compile-only pins: define() constructors take exactly the parameters declared
// by their function or class handler. The this parameter is never included.

import { apply, bind, call, createTypesCollection, decorate, define, lazy, mnemonica } from '..';
import type {
	IDefinitorInstance, InstanceResult, RegistryOf, TypeAbsorber, TypeConstructorBase, TypeRegistry
} from '..';

type Equal<Left, Right> =
	(<T>() => T extends Left ? 1 : 2) extends
	(<T>() => T extends Right ? 1 : 2)
		? true
		: false;
type Assert<Condition extends true> = Condition;

type RequiredShape = {
	name: string;
};

type NoArgsShape = {
	ready: boolean;
};

type OptionalShape = {
	name: string;
};

type RestShape = {
	prefix: string;
	values: number[];
};

type AShape = {
	a: string;
};

type BShape = {
	a: string;
	b: number;
};

type LazyShape = {
	note: string;
};

// Builder root: a required parameter is mandatory and checked.
const BuilderRoot = mnemonica.define('CtorArgsRoot', function (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
});
new BuilderRoot({ name: 'root' });
// @ts-expect-error — the required data parameter is missing
new BuilderRoot();
// @ts-expect-error — the required data parameter has the wrong shape
new BuilderRoot({ name: 42 });
type BuilderRootArgs = Assert<Equal<
	ConstructorParameters<typeof BuilderRoot>,
	[data: { name: string }]
>>;

// The legacy overload's R constraint accepts a precisely typed constructor.
type LegacyRegistry = TypeRegistry & Record<string, TypeConstructorBase>;
type TypedLegacyConstructor = IDefinitorInstance<
	RequiredShape,
	InstanceResult<RequiredShape>,
	LegacyRegistry,
	'',
	object,
	[data: { name: string }]
>;
const LegacyConstraint = define<RequiredShape, object, RequiredShape, TypedLegacyConstructor>(
	'CtorArgsLegacyConstraint',
	function (this: RequiredShape, data: { name: string }) {
		this.name = data.name;
	}
);
new LegacyConstraint({ name: 'legacy' });
// @ts-expect-error — the constrained result preserves its required parameter
new LegacyConstraint();
type LegacyConstraintArgs = Assert<Equal<
	ConstructorParameters<typeof LegacyConstraint>,
	[data: { name: string }]
>>;

// Chained subtype: a no-argument handler takes no construction arguments.
const ChainedNoArgs = BuilderRoot.define('CtorArgsNoArgs', function (this: NoArgsShape) {
	this.ready = true;
});
new ChainedNoArgs();
// @ts-expect-error — the handler declares no parameters
new ChainedNoArgs('unexpected');
type ChainedNoArgsArgs = Assert<Equal<
	ConstructorParameters<typeof ChainedNoArgs>,
	[]
>>;

// A custom collection: an optional parameter may be omitted or supplied.
const Optional = createTypesCollection().define('CtorArgsOptional', function (this: OptionalShape, data?: { name: string }) {
	this.name = data?.name ?? 'anonymous';
});
new Optional();
new Optional({ name: 'optional' });
// @ts-expect-error — the optional parameter still has a declared type
new Optional({ name: 42 });
type OptionalArgs = Assert<Equal<
	ConstructorParameters<typeof Optional>,
	[data?: { name: string }]
>>;

// Class handlers contribute their constructor parameters, excluding this.
class CtorArgsClass {
	value: string;
	constructor (data: { value: string }) {
		this.value = data.value;
	}
}
const ClassType = mnemonica.define('CtorArgsClass', CtorArgsClass);
new ClassType({ value: 'class' });
// @ts-expect-error — the class constructor requires data
new ClassType();
// @ts-expect-error — the class constructor data has the wrong shape
new ClassType({ value: 42 });
type ClassArgs = Assert<Equal<
	ConstructorParameters<typeof ClassType>,
	[data: { value: string }]
>>;

// No handler retains the open unknown[] constructor signature.
const Open = createTypesCollection().define('CtorArgsOpen');
new Open();
new Open('anything', 42);
type OpenArgs = Assert<Equal<
	ConstructorParameters<typeof Open>,
	unknown[]
>>;

// Required and rest parameters follow TypeScript's ordinary call rules.
const Rest = createTypesCollection().define('CtorArgsRest', function (this: RestShape, prefix: string, ...values: number[]) {
	this.prefix = prefix;
	this.values = values;
});
new Rest('items', 1, 2, 3);
// @ts-expect-error — the required prefix is missing
new Rest();
// @ts-expect-error — rest values must be numbers
new Rest('items', 1, 'wrong');
type RestArgs = Assert<Equal<
	ConstructorParameters<typeof Rest>,
	[prefix: string, ...values: number[]]
>>;

// A two-level registry exercises instance subtypes, relative lookup, and an
// absolute collection lookup of A.B with the same required constructor data.
const AB = createTypesCollection()
	.define('CtorArgsA', function (this: AShape, data: { a: string }) {
		this.a = data.a;
	})
	.define('CtorArgsB', function (this: BShape, data: { b: number }) {
		this.a = 'parent';
		this.b = data.b;
	});

const A = AB.lookup('CtorArgsA');
const a = new A({ a: 'a' });
new a.CtorArgsB({ b: 1 });
// @ts-expect-error — instance subtype construction requires data
new a.CtorArgsB();
// @ts-expect-error — instance subtype data has the wrong shape
new a.CtorArgsB({ b: 'wrong' });
type InstanceSubArgs = Assert<Equal<
	ConstructorParameters<typeof a.CtorArgsB>,
	[data: { b: number }]
>>;

const RelativeB = A.lookup('CtorArgsB');
new RelativeB({ b: 2 });
// @ts-expect-error — relative lookup preserves the required parameter
new RelativeB();
// @ts-expect-error — relative lookup preserves the parameter type
new RelativeB({ b: 'wrong' });
type RelativeLookupArgs = Assert<Equal<
	ConstructorParameters<typeof RelativeB>,
	[data: { b: number }]
>>;

const FullB = AB.lookup('CtorArgsA.CtorArgsB');
new FullB({ b: 3 });
// @ts-expect-error — absolute lookup preserves the required parameter
new FullB();
// @ts-expect-error — absolute lookup preserves the parameter type
new FullB({ b: 'wrong' });
type FullLookupArgs = Assert<Equal<
	ConstructorParameters<typeof FullB>,
	[data: { b: number }]
>>;

// Lazy definitions carry the returned handler's optional parameter list.
const Lazy = AB.lazy('CtorArgsLazy', () => function (this: LazyShape, data?: { note: string }) {
	this.note = data?.note ?? 'default';
});
new Lazy();
new Lazy({ note: 'lazy' });
// @ts-expect-error — the lazy handler's optional data remains typed
new Lazy({ note: 42 });
type LazyArgs = Assert<Equal<
	ConstructorParameters<typeof Lazy>,
	[data?: { note: string }]
>>;

// Free named define() carries its handler parameters.
type FreeShape = {
	value: string;
};
const FreeDefine = define('CtorArgsFreeDefine', function (this: FreeShape, data: { value: string }) {
	this.value = data.value;
});
new FreeDefine({ value: 'free' });
// @ts-expect-error — free define requires the declared data
new FreeDefine();
// @ts-expect-error — free define checks the declared data shape
new FreeDefine({ value: 42 });
type FreeDefineArgs = Assert<Equal<
	ConstructorParameters<typeof FreeDefine>,
	[data: { value: string }]
>>;

// define() named by its own function carries the same parameters.
const FreeFnDefine = define(function CtorArgsFreeFn (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
});
new FreeFnDefine({ name: 'free-fn' });
// @ts-expect-error — free define requires the declared data
new FreeFnDefine();
// @ts-expect-error — free define checks the declared data shape
new FreeFnDefine({ name: 42 });
type FreeFnDefineArgs = Assert<Equal<
	ConstructorParameters<typeof FreeFnDefine>,
	[data: { name: string }]
>>;

// Explicit generic callers keep the legacy R-overload behavior. One generic
// does not infer Args, and the second object generic is P rather than Args.
const ExplicitOne = define<RequiredShape>('CtorArgsExplicitOne', function (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
});
new ExplicitOne({ name: 'one' });
new ExplicitOne();
type ExplicitOneArgs = Assert<Equal<
	ConstructorParameters<typeof ExplicitOne>,
	unknown[]
>>;

const ExplicitTwo = define<RequiredShape, object>('CtorArgsExplicitTwo', function (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
});
new ExplicitTwo({ name: 'two' });
new ExplicitTwo();
type ExplicitTwoArgs = Assert<Equal<
	ConstructorParameters<typeof ExplicitTwo>,
	unknown[]
>>;

// A builder value's own define() carries Args into its return and registry.
const MethodDefine = AB.define('CtorArgsMethodDefine', function (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
});
new MethodDefine({ name: 'method' });
// @ts-expect-error — the method define requires the declared data
new MethodDefine();
// @ts-expect-error — the method define checks the declared data shape
new MethodDefine({ name: 42 });
type MethodDefineArgs = Assert<Equal<
	ConstructorParameters<typeof MethodDefine>,
	[data: { name: string }]
>>;

// Free define() without a handler keeps the open unknown[] signature.
const FreeOpen = define('CtorArgsFreeOpen');
new FreeOpen();
new FreeOpen('open', 42);
type FreeOpenArgs = Assert<Equal<
	ConstructorParameters<typeof FreeOpen>,
	unknown[]
>>;

// Free lazy() captures its returned handler's parameters.
const FreeLazy = lazy('CtorArgsFreeLazy', () => function (this: LazyShape, data: { note: string }) {
	this.note = data.note;
});
new FreeLazy({ note: 'free-lazy' });
// @ts-expect-error — free lazy requires the declared data
new FreeLazy();
// @ts-expect-error — free lazy checks the declared data shape
new FreeLazy({ note: 42 });
type FreeLazyArgs = Assert<Equal<
	ConstructorParameters<typeof FreeLazy>,
	[data: { note: string }]
>>;

// A builder value's own lazy() captures the same parameter list.
const SourceLazy = AB.lazy('CtorArgsSourceLazy', () => function (this: LazyShape, data: { note: string }) {
	this.note = data.note;
});
new SourceLazy({ note: 'source-lazy' });
// @ts-expect-error — the method lazy requires the declared data
new SourceLazy();
// @ts-expect-error — the method lazy checks the declared data shape
new SourceLazy({ note: 42 });
type SourceLazyArgs = Assert<Equal<
	ConstructorParameters<typeof SourceLazy>,
	[data: { note: string }]
>>;

// The config is the last argument: the second one when the function or class
// comes first, on every level.
const FnWithConfig = define(function CtorArgsFnConfig (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
}, { strictChain: false });
new FnWithConfig({ name: 'config' });
// @ts-expect-error — the config changes nothing about the declared data
new FnWithConfig();
type FnWithConfigArgs = Assert<Equal<
	ConstructorParameters<typeof FnWithConfig>,
	[data: { name: string }]
>>;
const ClassWithConfig = define(class CtorArgsClassConfig {
	size: number;
	constructor (size: number) {
		this.size = size;
	}
}, { strictChain: false });
export const classWithConfigSize: number = new ClassWithConfig(1).size;
// @ts-expect-error — the class declares its data
new ClassWithConfig('1');
export const noHandlerName: string = new (define<RequiredShape>('CtorArgsNoHandler', { strictChain: false }))().name;

const argsCollection = createTypesCollection();
const ArgsRoot = argsCollection.define(function CtorArgsCollectionFn (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
}, { strictChain: false });
export const argsRootName: string = new ArgsRoot({ name: 'root' }).name;
const ArgsChild = AB.define(class CtorArgsChildClass {
	size: number;
	constructor (size: number) {
		this.size = size;
	}
}, { strictChain: false });
export const argsChildSize: number = new ArgsChild(1).size;
// the name is only a string for TypeScript: the registry goes on unchanged,
// also through the types defined on the result
const ArgsGrandChild = ArgsChild.define('CtorArgsGrandChild', function (this: { leaf: boolean }) {
	this.leaf = true;
});
export const argsGrandChildSize: number = new ArgsGrandChild().size;
type ArgsChildRegistry = Assert<Equal<keyof RegistryOf<typeof ArgsChild>, keyof RegistryOf<typeof AB>>>;
type ArgsGrandChildRegistry = Assert<Equal<keyof RegistryOf<typeof ArgsGrandChild>, keyof RegistryOf<typeof AB>>>;
AB.define('CtorArgsNoHandlerBuilder', { strictChain: false });

// Nothing goes after the config, and only a config goes there.
// @ts-expect-error — the config was the last argument
define(function CtorArgsExtraFn () {}, { strictChain: false }, { strictChain: false });
// @ts-expect-error — the second argument is the config
define(function CtorArgsUndefinedFn () {}, undefined, { strictChain: false });
// @ts-expect-error — the config was the last argument
define('CtorArgsExtraName', { strictChain: false }, { strictChain: false });
// @ts-expect-error — the config was the last argument
define('CtorArgsExtraHandler', function () {}, { strictChain: false }, { strictChain: false });
// @ts-expect-error — a second function is not a config
define(function CtorArgsTwoFns () {}, function Second () {});
// @ts-expect-error — a string is not a config
define(function CtorArgsString () {}, 'strictChain');
// @ts-expect-error — with a string first, a second function is the handler, and a third is not a config
define('CtorArgsTwoFnsNamed', function () {}, function Second () {});
// @ts-expect-error — a class is not a config
AB.define('CtorArgsTwoFnsNamedB', function () {}, class Second {});
// @ts-expect-error — the first argument is required
define();
// @ts-expect-error — the config was the last argument
AB.define(function CtorArgsExtraFnB () {}, { strictChain: false }, { strictChain: false });
// @ts-expect-error — the second argument is the config
AB.define(function CtorArgsUndefinedFnB () {}, undefined, { strictChain: false });
// @ts-expect-error — the config was the last argument
AB.define('CtorArgsExtraNameB', { strictChain: false }, { strictChain: false });
// @ts-expect-error — a second function is not a config
AB.define(function CtorArgsTwoFnsB () {}, function Second () {});
// @ts-expect-error — the first argument is required
AB.define();
// @ts-expect-error — the config was the last argument
argsCollection.define(function CtorArgsExtraFnC () {}, { strictChain: false }, { strictChain: false });
declare const absorber: TypeAbsorber;
// @ts-expect-error — the config was the last argument
absorber(function CtorArgsExtraFnA () {}, { strictChain: false }, { strictChain: false });
// @ts-expect-error — a second function is not a config
absorber(function CtorArgsTwoFnsA () {}, function Second () {});

// true / false in the config place is strictChain ...
define(function CtorArgsTrue () {}, true);
define('CtorArgsFalse', function () {}, false);
define('CtorArgsFalseNoHandler', false);
lazy('CtorArgsFalseLazy', () => function () {}, false);
AB.define(function CtorArgsTrueB () {}, true);
AB.define('CtorArgsFalseB', function () {}, false);
AB.lazy('CtorArgsFalseLazyB', () => function () {}, false);
absorber(function CtorArgsFalseA () {}, false);
// ... and a function is ModificationConstructor: the built-in one ...
const { defaultOptions: { ModificationConstructor: builtIn } } = mnemonica;
define(function CtorArgsBuiltIn () {}, builtIn);
define('CtorArgsBuiltInNamed', function () {}, builtIn);
lazy('CtorArgsBuiltInLazy', () => function () {}, builtIn);
AB.define(function CtorArgsBuiltInB () {}, builtIn);
AB.define('CtorArgsBuiltInNamedB', function () {}, builtIn);
absorber('CtorArgsBuiltInA', function () {}, builtIn);
define('CtorArgsBuiltInOption', function () {}, { ModificationConstructor : builtIn });
// ... or an own one
const WithOwn = define(function CtorArgsOwn (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
}, () => {
	const modificator = function (
		this: object,
		...[ ModificatorType, proto, addProps ]: Parameters<ReturnType<typeof builtIn>>
	) {
		const result = builtIn().call(this, ModificatorType, proto, addProps);
		return result;
	};
	return modificator;
});
export const withOwnName: string = new WithOwn({ name: 'own' }).name;

// decorators take the same config
@decorate(false)
export class CtorArgsDecorated {}
@decorate(ArgsRoot, false)
export class CtorArgsDecoratedSub {}
@decorate(ArgsRoot, builtIn)
export class CtorArgsDecoratedMc {}

// The class or function mode is detected from the handler, never an option.
// @ts-expect-error — asClass is not part of constructorOptions
define('CtorArgsAsClassOption', function () {}, { asClass: true });

// apply/call/bind infer the constructor's required argument list.
apply({ parent: true }, BuilderRoot, [{ name: 'apply' }]);
// @ts-expect-error — apply requires the data array when the constructor requires data
apply({ parent: true }, BuilderRoot);
// @ts-expect-error — apply requires the constructor's data tuple
apply({ parent: true }, BuilderRoot, []);
// @ts-expect-error — apply checks the tuple's data shape
apply({ parent: true }, BuilderRoot, [{ name: 42 }]);

call({ parent: true }, BuilderRoot, { name: 'call' });
// @ts-expect-error — call requires the constructor's data
call({ parent: true }, BuilderRoot);
// @ts-expect-error — call checks the data shape
call({ parent: true }, BuilderRoot, { name: 42 });

const BoundRoot = bind({ parent: true }, BuilderRoot);
BoundRoot({ name: 'bind' });
// @ts-expect-error — the bound function requires the constructor's data
BoundRoot();
// @ts-expect-error — the bound function checks the data shape
BoundRoot({ name: 42 });
type BoundRootArgs = Assert<Equal<
	Parameters<typeof BoundRoot>,
	[data: { name: string }]
>>;

// Only constructors: the function given to define() is not one.
const plainHandler = function (this: RequiredShape, data: { name: string }) {
	this.name = data.name;
};
// @ts-expect-error — apply takes a constructor, not a plain function
apply({ parent: true }, plainHandler, [{ name: 'apply' }]);
// @ts-expect-error — call takes a constructor, not a plain function
call({ parent: true }, plainHandler, { name: 'call' });
// @ts-expect-error — bind takes a constructor, not a plain function
bind({ parent: true }, plainHandler);

// Optional and no-argument constructors keep their ordinary invocation rules.
apply({ parent: true }, Optional);
apply({ parent: true }, Optional, [{ name: 'optional-apply' }]);
// @ts-expect-error — apply preserves the optional parameter's type
apply({ parent: true }, Optional, [{ name: 42 }]);

apply({ parent: true }, ChainedNoArgs);
// @ts-expect-error — a no-argument constructor rejects apply data
apply({ parent: true }, ChainedNoArgs, ['unexpected']);
call({ parent: true }, ChainedNoArgs);
// @ts-expect-error — a no-argument constructor rejects call data
call({ parent: true }, ChainedNoArgs, 'unexpected');

// Rest parameters remain variadic through apply/call/bind.
apply({ parent: true }, Rest, ['rest', 1, 2]);
// @ts-expect-error — apply rejects a non-number rest value
apply({ parent: true }, Rest, ['rest', 1, 'wrong']);
call({ parent: true }, Rest, 'rest', 1, 2);
// @ts-expect-error — call rejects a non-number rest value
call({ parent: true }, Rest, 'rest', 1, 'wrong');
const BoundRest = bind({ parent: true }, Rest);
BoundRest('rest', 1, 2);
// @ts-expect-error — the bound function rejects a non-number rest value
BoundRest('rest', 1, 'wrong');
type BoundRestArgs = Assert<Equal<
	Parameters<typeof BoundRest>,
	[prefix: string, ...values: number[]]
>>;
