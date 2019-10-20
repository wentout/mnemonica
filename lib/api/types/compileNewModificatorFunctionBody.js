'use strict';

const compileNewModificatorFunctionBody = function (FunctionName) {
	return new Function('ConstructHandler', 'CreationHandler', 'SymbolConstructorName',
		`
		function ${FunctionName} (...args) {
			const answer = ConstructHandler.call(this, ...args);
			return CreationHandler.call(this, answer);
		};
		
		Object.defineProperty(${FunctionName}, SymbolConstructorName, {
			get () {
				return '${FunctionName}';
			}
		});
		
		return ${FunctionName};
		
	`);
};

module.exports = compileNewModificatorFunctionBody;
