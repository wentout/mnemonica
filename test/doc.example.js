const mnemonica = require('..');
const { define } = mnemonica;
const {
	extract,
	parse
} = mnemonica.utils;

const TypeModificationProcedure = function (opts) {
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

};

const TypeModificationPrototype = {
	description : 'SomeType Constructor'
};

const SomeType = define('SomeTypeConstructor',
	TypeModificationProcedure,
	// prototype definition is NOT obligatory
	TypeModificationPrototype);

const SomeSubType = SomeType.define('SomeSubType', function (opts) {
	const {
		other,
		// again
		inside
	} = opts;
	this.other = other;
	// here we will re-define
	// our previously defined property
	// with the new value
	this.inside = inside;
}, {
	description : 'SomeSubType Constructor'
});

const someTypeInstance = new SomeType({
	some   : 'arguments',
	data   : 'necessary',
	inside : 'of SomeType definition'
});

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


const parsed = parse(someSubTypeInstance);
console.log(parsed);

const extracted = someSubTypeInstance.extract();
console.log(extracted);

console.log(extract(someTypeInstance));

// true
console.log(someTypeInstance instanceof SomeType);
// true
console.log(someSubTypeInstance instanceof SomeType);
// true
console.log(someSubTypeInstance instanceof SomeSubType);
// who there can care... but, yes, it is: true
console.log(someSubTypeInstance instanceof someTypeInstance);
// and also this is true again:
console.log(someSubTypeInstance instanceof someTypeInstance.SomeSubType);

debugger;
