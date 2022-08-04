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

// however, for better understanding of what is going on here
// I'd like to provide solution with preliminary compiled functions

const getClassConstructor = ( ConstructHandler: any, CreationHandler: any, ) => {
	return class extends ConstructHandler {
		constructor ( ...args: any[] ) {
			const answer = super( ...args );
			debugger;
			return CreationHandler.call( this, answer );
		}
	};
};

const getFunctionConstructor = ( ConstructHandler: any, CreationHandler: any, ) => {
	return function ( this: any, ...args: any[] ) {
		const answer = ConstructHandler.call( this, ...args );
		debugger;
		return CreationHandler.call( this, answer );
	};
};

const compileNewModificatorFunctionBody = function ( FunctionName: string, asClass: boolean = false ) {
	return function ( ConstructHandler: any, CreationHandler: any, SymbolConstructorName: symbol ): any {
		return function () {
			let ModificationBody: any;
			if ( asClass ) {
				ModificationBody = getClassConstructor( ConstructHandler, CreationHandler );
			} else {
				ModificationBody = getFunctionConstructor( ConstructHandler, CreationHandler );
			}
			ModificationBody.prototype.constructor = ModificationBody;
			Object.defineProperty( ModificationBody.prototype.constructor, 'name', {
				value: FunctionName,
				writable: false
			} );
			Object.defineProperty( ModificationBody, SymbolConstructorName, {
				get () {
					return FunctionName;
				}
			} );
			return ModificationBody;
		};
	};
};

*/

const compileNewModificatorFunctionBody = function ( FunctionName: string, asClass: boolean = false ) {
	
	const dt = `${Date.now()}_${`${Math.random()}`.split('.')[1]}`;

	const modString = asClass ?

		`class ${FunctionName} extends ConstructHandler_${dt} {
			constructor(...args) {
				const answer = super(...args);
				return CreationHandler_${dt}.call(this, answer);
			}
		}`

		:

		`const ${FunctionName} = function (...args) {
			const answer = ConstructHandler_${dt}.call(this, ...args);
			return CreationHandler_${dt}.call(this, answer);
		};`;

	return new Function( `ConstructHandler_${dt}`, `CreationHandler_${dt}`, 'SymbolConstructorName',
		`return function () {

			${modString}

			Object.defineProperty(${FunctionName}, SymbolConstructorName, {
				get () {
					return '${FunctionName}';
				}
			});

			return ${FunctionName};

		};
	`);
};

export default compileNewModificatorFunctionBody;
