'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const compileNewModificatorFunctionBody = function (FunctionName, asClass = false) {
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
	return new Function('ConstructHandler', 'CreationHandler', 'SymbolConstructorName', `return function () {
			
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
exports.default = compileNewModificatorFunctionBody;
