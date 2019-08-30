'use strict';

const compileNewModificatorFunctionBody = function (FunctionName) {
	return new Function('ConstructHandler', 'CreationHandler', 'proto', 'SymbolConstructorName',
	`
		const ${FunctionName} = function ${FunctionName} (...args) {
			const answer = ConstructHandler.call(this, ...args);
			return CreationHandler.call(this, answer);
		};
		
		${FunctionName}[SymbolConstructorName] = '${FunctionName}';
		${FunctionName}.prototype = proto;
		
		return ${FunctionName};
	`);
};

module.exports = compileNewModificatorFunctionBody;