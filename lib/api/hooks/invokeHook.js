'use strict';


const {
	flowCheckers
} = require('./flowCheckers');

module.exports = function (hookType, opts) {
	
	const {
		type,
		existentInstance,
		inheritedInstance,
		args
	} = opts;
	
	
	if (!Object.prototype.hasOwnProperty.call(this.hooks, hookType)) {
		return;
	}
	
	// "this" referes to
	// namespace, if called from namespaces
	// type, if called from types
	
	const {
		TypeName,
		// parentType,
	} = type;
	
	const invocationResults = new WeakSet();
	
	const hookArgs = {
		type,
		TypeName,
		existentInstance,
		args,
	};
	
	inheritedInstance && Object.assign(hookArgs, {
		inheritedInstance
	});
	
	this.hooks[hookType].forEach(hook => {
		const result = hook.call(this, hookArgs);
		invocationResults.add({ result });
	});
	
	const flowChecker = flowCheckers.get(this);
	(typeof flowChecker === 'function') && flowChecker
		.call(this, Object.assign({}, {
			invocationResults,
			hookType,
		}, hookArgs));
	
	return invocationResults;
	
};
