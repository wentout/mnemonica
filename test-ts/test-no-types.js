'use strict';
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept (f) { if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected'); return f; }
	var { kind } = contextIn, key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
	var target = !descriptorIn && ctor ? contextIn[ 'static' ] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[ p ] = p === 'access' ? {} : contextIn[ p ];
		for (var p in contextIn.access) context.access[ p ] = contextIn.access[ p ];
		context.addInitializer = function (f) { if (done) throw new TypeError('Cannot add initializers after decoration has completed'); extraInitializers.push(accept(f || null)); };
		var result = (0, decorators[ i ])(kind === 'accessor' ? { get : descriptor.get, set : descriptor.set } : descriptor[ key ], context);
		if (kind === 'accessor') {
			if (result === void 0) continue;
			if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		}
		else if (_ = accept(result)) {
			if (kind === 'field') initializers.unshift(_);
			else descriptor[ key ] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) {
		value = useValue ? initializers[ i ].call(thisArg, value) : initializers[ i ].call(thisArg);
	}
	return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
	if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
	return Object.defineProperty(f, 'name', { configurable : true, value : prefix ? ''.concat(prefix, ' ', name) : name });
};
Object.defineProperty(exports, '__esModule', { value : true });
var __1 = require('..');
var SomeType = (0, __1.define)('SomeType', function () {
	this.one = 'SomeType';
	this.check = 321;
	this.q = 123;
}, {
	l : 12345
});
var SomeSubType = SomeType.define('SomeSubType', function () {
	this.one = undefined;
	this.two = 'SomeSubType';
	this.q = 123;
}, {
	k : 123
});
var first = new SomeType();
var x = first.one;
first.one = 123; // hinting is correct !
first.q = 'one'; // hinting is correct !
first.l = '111'; // hinting is correct !
first.x = 543; // hinting is NOT VERY correct !
var FinalType = SomeSubType.define('FinalType', function () {
	this.one = 'final one';
	this.three = 'FinalType';
	this.q = 123;
});
var second = new first.SomeSubType();
var y = second.one;
second.check = 123; // hinting is correct !
second.two = 'two';
second.y = 'no way'; // hinting is correct !
second.k = 'no way'; // hinting is correct !
var final = new second.FinalType();
// const final = new FinalType();
final.one = 'must one';
final.two = 'must two';
final.three = 'must two';
final.check = 'there is mumber'; // hinting is correct !
final.z = 'no way'; // hinting is correct !
var z = final.one;
// tslint:disable-next-line: no-console
console.log('\nNo Typings: \n');
// tslint:disable-next-line: no-console
console.log('first: ', first);
// tslint:disable-next-line: no-console
console.log('second: ', second);
// tslint:disable-next-line: no-console
console.log('final: ', final);
// tslint:disable-next-line: no-console
console.log('{ x, y, z }: ', { x : x, y : y, z : z });
var aSub = (0, __1.apply)(first, SomeSubType);
console.log(aSub);
var bSub = (0, __1.bind)(first, SomeSubType)();
console.log(bSub);
var cSub = (0, __1.call)(first, SomeSubType);
console.log(cSub);
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
// function defined  <T> (cstr: IDEF<T>, s: unknown) {
function defined (cstr, s) {
	console.log(s);
	debugger;
	(0, __1.define)(cstr.name, cstr);
}
var MyClass = function () {
	var _classDecorators = [ defined ];
	var _classDescriptor;
	var _classExtraInitializers = [];
	var _classThis;
	var MyClass = _classThis = /** @class */ (function () {
		function MyClass_1 () {
			this.z = 123;
		}
		return MyClass_1;
	}());
	__setFunctionName(_classThis, 'MyClass');
	(function () {
		var _metadata = typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
		__esDecorate(null, _classDescriptor = { value : _classThis }, _classDecorators, { kind : 'class', name : _classThis.name, metadata : _metadata }, null, _classExtraInitializers);
		MyClass = _classThis = _classDescriptor.value;
		if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable : true, configurable : true, writable : true, value : _metadata });
		__runInitializers(_classThis, _classExtraInitializers);
	})();
	return MyClass = _classThis;
}();
var myInstance = new MyClass;
console.log(myInstance.z);
