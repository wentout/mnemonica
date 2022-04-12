'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.invokeHook = void 0;
const constants_1 = require('../../constants');
const { MNEMONICA, } = constants_1.constants;
const flowCheckers_1 = require('./flowCheckers');
const hop_1 = require('../../utils/hop');
const invokeHook = function (hookType, opts) {
	const { type, existentInstance, inheritedInstance, args, creator } = opts;
	const invocationResults = new Set();
	const self = this;
	if ((0, hop_1.hop)(self.hooks, hookType)) {
		const { TypeName, } = type;
		const hookArgs = {
			type,
			TypeName,
			existentInstance : existentInstance.constructor.name === MNEMONICA ?
				null : existentInstance,
			args,
		};
		if (typeof inheritedInstance === 'object') {
			Object.assign(hookArgs, {
				inheritedInstance,
				bindMethod (name, method) {
					creator.bindMethod(inheritedInstance, name, method);
				},
				bindProtoMethods () {
					creator.bindProtoMethods();
				},
				throwModificationError (error) {
					creator.throwModificationError(error);
				}
			});
		}
		this.hooks[hookType].forEach((hook) => {
			const result = hook.call(self, hookArgs);
			invocationResults.add(result);
		});
		const flowChecker = flowCheckers_1.flowCheckers.get(this);
		if (typeof flowChecker === 'function') {
			flowChecker
				.call(this, Object.assign({}, {
					invocationResults,
					hookType,
				}, hookArgs));
		}
	}
	return invocationResults;
};
exports.invokeHook = invokeHook;
