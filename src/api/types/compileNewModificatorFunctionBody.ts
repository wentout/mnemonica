'use strict';

import { hop } from '../../utils/hop';
import { ErrorsTypes } from '../../descriptors/errors';

const { WRONG_MODIFICATION_PATTERN, } = ErrorsTypes;
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

export interface ConstructHandler extends CallableFunction {
	(this: object, ...args: unknown[]): unknown;
	prototype: object;
}

export interface ClassConstructHandler extends NewableFunction {
	new (...args: unknown[]): object;
	prototype: object;
}

export interface CreationHandler extends CallableFunction {
	(this: object, answer: unknown): unknown;
}

// Classify the construct handler ONCE at define time from two cheap
// facts only — constructor.name and own prototype — NO toString()
// (overhead, fragile under transpilers). Async forms are NOT
// separable beyond 'AsyncFunction' (async arrows and async methods
// take the async path, accepted by design); a sync Function without
// its own prototype is a sync arrow, a shorthand method or a bound
// function — the three are indistinguishable here and all are
// rejected with the readable error (the docs: write constructors as
// regular functions or classes).
export const classifyConstructHandler = ( FunctionName: string, ConstructHandler: ConstructHandler ) => {
	const handlerKind = ConstructHandler.constructor.name;
	const hasOwnPrototype = hop(
		ConstructHandler,
		'prototype'
	);

	if (
		handlerKind === 'GeneratorFunction' ||
		handlerKind === 'AsyncGeneratorFunction'
	) {
		const msg = `${FunctionName}: generator functions are not supported as a constructor`;
		throw new WRONG_MODIFICATION_PATTERN( msg );
	}

	if ( handlerKind === 'Function' && !hasOwnPrototype ) {
		const msg = `${FunctionName}: constructor must be a regular function or a class ` +
			'(arrow functions, methods and bound functions are not supported)';
		throw new WRONG_MODIFICATION_PATTERN( msg );
	}
};

const getClassConstructor = (
	ConstructHandler: ClassConstructHandler,
	CreationHandler: CreationHandler,
) => {
	const result = class extends ConstructHandler {
		// oxlint-disable-next-line constructor-super
		constructor ( ...args: unknown[] ) {
			const answer = super( ...args );
			// debugger;
			const creationResult = CreationHandler.call(
				this,
				answer 
			);
			const castResult = creationResult as object;
			return castResult;
		}
	};
	return result;
};

const getFunctionConstructor = (
	ConstructHandler: ConstructHandler,
	CreationHandler: CreationHandler,
) => {
	const newable = hop(
		ConstructHandler,
		'prototype' 
	) &&
		hop(
			ConstructHandler.prototype,
			'constructor' 
		) &&
		(ConstructHandler.prototype.constructor == ConstructHandler);

	const funcResult = function ( this: object, ...args: unknown[] ) {
		let answer;
		// if (!new.target) {
		// 	debugger;
		// }
		if ( !newable ) {
			answer = ConstructHandler.call(
				this,
				...args 
			);
		} else {
			// historical prototype swap kept for reference:
			// const _proto = ConstructHandler.prototype;
			// !!! it MUST be strict replacement !!!
			// !!! this is the only way to keep Prototype Chain correct !!!
			// ConstructHandler.prototype = this.constructor.prototype;
			// answer = new (ConstructHandler as unknown as new (...args: unknown[]) => object)( ...args );
			// ConstructHandler.prototype = _proto;

			const constructResult = Reflect.construct(
				ConstructHandler,
				args,
				this.constructor
			);
			answer = constructResult;
		}
		const result = CreationHandler.call(
			this,
			answer 
		);
		return result;
	};
	return funcResult;
};

type ModificationBody = new (...args: unknown[]) => object;

const compileNewModificatorFunctionBody = function ( FunctionName: string, asClass = false ) {
	const outerResult = function (
		ConstructHandler: ConstructHandler,
		CreationHandler: CreationHandler,
		SymbolConstructorName: symbol
	): () => ModificationBody {
		const innerResult = function (): ModificationBody {
			let ModificationBody: ModificationBody;
			if ( asClass ) {
				// this branch runs only when isClass() verified at define
				// time that the handler is a class — the cast names the class
				// view (construct signature) of that same function value
				ModificationBody = getClassConstructor(
					ConstructHandler as unknown as ClassConstructHandler,
					CreationHandler
				);
			} else {
				// const ReNamedConstructHandler = {} as unknown;
				// ReNamedConstructHandler[FunctionName] = ConstructHandler;
				// ModificationBody = getFunctionConstructor(ReNamedConstructHandler[FunctionName], CreationHandler);
				// the compiled body is invoked with `new` by the pipeline;
				// a function expression carries no construct signature, so
				// the `new`-able view of the same value is named here
				ModificationBody = getFunctionConstructor(
					ConstructHandler,
					CreationHandler
				) as unknown as ModificationBody;
			}
			ModificationBody.prototype.constructor = ModificationBody;
			Object.defineProperty(
				ModificationBody.prototype.constructor,
				'name',
				{
					value    : FunctionName,
					writable : false
				} 
			);
			Object.defineProperty(
				ModificationBody,
				SymbolConstructorName,
				{
					get () {
					// return new String( FunctionName );
						return FunctionName;
					}
				} 
			);
			// Object.freeze( ModificationBody.prototype.constructor );
			// Object.freeze( ModificationBody.prototype );
			// Object.freeze( ModificationBody );
			const result = ModificationBody;
			return result;
		};
		return innerResult;
	};
	return outerResult;
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
