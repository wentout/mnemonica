'use strict';

/*

// it is not that easy
// constructor name diappears when you look on 'this'
// using Chrome Dev tools debugger for example
// adding 'debugger;' keyword next line to 
// 'const answer = ' see example down below

// thought for console.log it is there

// Also, as it is written here
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

// the name of the function might be obfuscated during bundling
// therefore it seems to be more correct to implement using 'new Function'

// therefore considering we have open bug now:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1350404
// related to the links below
// https://gist.github.com/wentout/5dcdd34f926460d89c8c1552d1bbc3d7
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

// we will use next solution as working code
// because this.constructor.name kept OK
// just the bug is for Chrome Dev Tools

// and as preliminary compiled functions solution works faster
// and does not require new code compilation
// we will keep it further

*/

const getClassConstructor = ( ConstructHandler: any, CreationHandler: any, ) => {
	return class extends ConstructHandler {
		constructor ( ...args: any[] ) {
			const answer = super( ...args );
			// debugger;
			return CreationHandler.call( this, answer );
		}
	};
};

const getFunctionConstructor = ( ConstructHandler: any, CreationHandler: any, ) => {
	const newable = Object.hasOwnProperty.call( ConstructHandler, 'prototype' );
	// const hasReturnStatement = ConstructHandler.toString().indexOf('return') > -1;
	return function ( this: any, ...args: any[] ) {
		let answer;
		// if (!new.target) {
		// 	debugger;
		// }
		// if (hasReturnStatement || !newable) {
		if ( !newable ) {
			answer = ConstructHandler.call( this, ...args );
		} else {
			const _proto = ConstructHandler.prototype;
			ConstructHandler.prototype = this.constructor.prototype;
			answer = new ConstructHandler( ...args );
			ConstructHandler.prototype = _proto;
		}
		return CreationHandler.call( this, answer );
	};
};

const compileNewModificatorFunctionBody = function ( FunctionName: string, asClass = false ) {
	return function ( ConstructHandler: any, CreationHandler: any, SymbolConstructorName: symbol ): any {
		return function () {
			let ModificationBody: any;
			if ( asClass ) {
				ModificationBody = getClassConstructor( ConstructHandler, CreationHandler );
			} else {
				// const ReNamedConstructHandler = {} as any;
				// ReNamedConstructHandler[FunctionName] = ConstructHandler;
				// ModificationBody = getFunctionConstructor(ReNamedConstructHandler[FunctionName], CreationHandler);
				ModificationBody = getFunctionConstructor( ConstructHandler, CreationHandler );
			}
			ModificationBody.prototype.constructor = ModificationBody;
			Object.defineProperty( ModificationBody.prototype.constructor, 'name', {
				value    : FunctionName,
				writable : false
			} );
			Object.defineProperty( ModificationBody, SymbolConstructorName, {
				get () {
					// return new String( FunctionName );
					return FunctionName;
				}
			} );
			return ModificationBody;
		};
	};
};

export default compileNewModificatorFunctionBody;


/*

// however, for better understanding of what is going on here
// I'd like to provide 

const compileNewModificatorFunctionBody = function ( FunctionName: string, asClass = false ) {

	const dt = `${Date.now()}_${`${Math.random()}`.split( '.' )[ 1 ]}`;

	const modString = asClass ?

		`class ${FunctionName} extends ConstructHandler_${dt} {
			constructor(...args) {
				const answer = super(...args);
				return CreationHandler_${dt}.call(this, answer);
			}
		}`

		:

		`const ${FunctionName} = function (...args) {
			const newable = Object.hasOwnProperty.call( ConstructHandler_${dt}, 'prototype' );
			let answer;
			if ( !newable ) {
				answer = ConstructHandler_${dt}.call( this, ...args );
			} else {
				const _proto = ConstructHandler_${dt}.prototype;
				ConstructHandler_${dt}.prototype = this.constructor.prototype;
				answer = new ConstructHandler_${dt}( ...args );
				ConstructHandler_${dt}.prototype = _proto;
			}
			return CreationHandler_${dt}.call( this, answer );
		};`;

	return new Function( `ConstructHandler_${dt}`, `CreationHandler_${dt}`, 'SymbolConstructorName',
		`return function () {

			${modString}

			Object.defineProperty(${FunctionName}, SymbolConstructorName, {
				get () {
					return new String( '${FunctionName}' );
				}
			});

			return ${FunctionName};

		};
	`);
};

export default compileNewModificatorFunctionBody;

*/
