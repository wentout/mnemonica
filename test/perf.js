'use srict';
// setInterval(()=>{}, 1000);


const {
	define,
	lookup
} = require('..');


const HowMany = 1000;

var start = process.hrtime.bigint();
// var start = Date.now();


var _define = define;
for (let i = 0; i < HowMany; i++) {
	const its = _define(`NestedType${i}`, function () {
		this[ `nestedProp${i}` ] = `nestedProp${i}`;
	});
	_define = its.define.bind(its);
}

var end = process.hrtime.bigint();
// var end = Date.now();
console.log('Diff 1:', end - start);


start = process.hrtime.bigint();

const NestedType0 = lookup('NestedType0');

var instance = new NestedType0();
for (let i = 1; i < HowMany; i++) {
	instance = new instance[ `NestedType${i}` ]();
}

end = process.hrtime.bigint();
const diff2 = end - start;
console.log('Diff 2:', diff2);


const Creator = function (its) {
	const Maker = function () {};
	Maker.prototype = its;
	return new Maker;
};

start = process.hrtime.bigint();

var obj = {
	ObjType0    : {},
	nestedProp0 : 'nestedProp0'
};
var current = obj.ObjType0;
for (let i = 1; i < HowMany; i++) {
	current[ `ObjType${i}` ] = new Creator({
		[ `nestedProp${i}` ] : `nestedProp${i}`
	});
	obj[ `nestedProp${i}` ] = current[ `ObjType${i}` ][ `nestedProp${i}` ];
	current = current[ `ObjType${i}` ];
}

end = process.hrtime.bigint();
const diff3 = end - start;
console.log('Diff 3:', diff3);
console.log('Diff 2/3:', diff2/diff3);


console.log('Access Time');

start = process.hrtime.bigint();
// start = Date.now();
const propI = instance[ 'nestedProp0' ];
console.log(propI);
end = process.hrtime.bigint();
// end = Date.now();
const diff4 = end - start;
console.log('Diff 4:', diff4);


start = process.hrtime.bigint();
// start = Date.now();
const propO = obj[ 'nestedProp0' ];
console.log(propO);
end = process.hrtime.bigint();
// end = Date.now();
const diff5 = end - start;
console.log('Diff 5:', diff5);
console.log('Diff 4/5:', diff4/diff5);




console.log('How Many');

const insArr = [];
start = process.hrtime.bigint();

for (let i = 1; i < HowMany; i++) {
	insArr.push(new NestedType0());
}

end = process.hrtime.bigint();
const diff6 = end - start;
console.log('Diff 6:', diff6);


const objArr = [];
start = process.hrtime.bigint();



for (let i = 1; i < HowMany; i++) {
	objArr.push(new Creator(Object.create({ nestedProp0 : 'nestedProp0' })));
}

end = process.hrtime.bigint();
const diff7 = end - start;
console.log('Diff 7:', diff7);
console.log('Diff 6/7:', diff6/diff7);


