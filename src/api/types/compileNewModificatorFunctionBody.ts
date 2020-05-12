'use strict';

const compileNewModificatorFunctionBody = function (FunctionName: string, asClass:boolean = false) {
	
	const modString = asClass ?
	`class ${FunctionName} extends ConstructHandler {
		constructor(...args) {
			const answer = super(...args);
			return CreationHandler.call(this, answer);
		}
	}`
	:
	`const ${FunctionName} = function (...args) {
		const answer = ConstructHandler.call(this, ...args);
		return CreationHandler.call(this, answer);
	};`;
	
	return new Function('ConstructHandler', 'CreationHandler', 'SymbolConstructorName',
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
