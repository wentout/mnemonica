'use strict';

module.exports = function (hookType, opts) {
	
	const {
		TypeDescriptor,
		// existentInstance,
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
	
	const invocationResults = new Set();
	
	this.hooks[hookType].forEach(hook => {
		const result = hook({
			
			TypeName,
			instance : inheritedInstance,
			args
			
		});
		
		invocationResults.add(result);
	});
	
	(typeof this.flowChecker === 'function') && this.flowChecker({
		hookType,
		TypeName,
		instance : inheritedInstance,
		invocationResults,
		args,
		
	});
	
	return invocationResults;
	
};