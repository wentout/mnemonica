'use strict';

const {
	MISSING_CALLBACK_ARGUMENT,
	FLOW_CHECKER_REDEFINITION,
} = require('../../errors');


module.exports = function (cb) {
	
	if (typeof cb !== 'function') {
		throw new MISSING_CALLBACK_ARGUMENT;
	}
	
	if (this.flowChecker) {
		throw new FLOW_CHECKER_REDEFINITION;
		
	}
	
	this.flowChecker = cb;
	
};