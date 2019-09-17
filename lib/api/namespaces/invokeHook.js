'use strict';

module.exports = function (hookType, opts) {
	
	const {
		TypeDescriptor,
		existentInstance,
		inheritedInstance,
		args
	} = opts;
	
	
	if (!this.hooks[hookType]) {
		return;
	}
	
	// "this" referes to
	// namespace, if called from namespaces
	// type, if called from types
	
	const {
		TypeName,
		// parentType,
	} = TypeDescriptor;
	
	const invocationResults = new WeakSet();
	
	const hookArgs = {
		TypeName,
		existentInstance,
		args,
	};
	
	inheritedInstance && Object.assign(hookArgs, {
		inheritedInstance
	});
	
	this.hooks[hookType].forEach(hook => {
		const result = hook(hookArgs);
		invocationResults.add({ result });
	});
	
	(typeof this.flowChecker === 'function') &&
		this.flowChecker(Object.assign({
			invocationResults,
			hookType,
		}, hookArgs));
	
	return invocationResults;
	
};