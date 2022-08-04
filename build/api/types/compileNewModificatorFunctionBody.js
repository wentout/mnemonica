'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
const compileNewModificatorFunctionBody = function (FunctionName, asClass = false) {
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
	return new Function(`ConstructHandler_${dt}`, `CreationHandler_${dt}`, 'SymbolConstructorName', `return function () {

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
