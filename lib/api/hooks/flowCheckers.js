'use strict';

const {
	MISSING_CALLBACK_ARGUMENT,
	FLOW_CHECKER_REDEFINITION,
} = require('../../descriptors/errors');

const flowCheckers = new WeakMap();

module.exports = {
	flowCheckers,
	registerFlowChecker : function (cb) {
		
		if (typeof cb !== 'function') {
			throw new MISSING_CALLBACK_ARGUMENT;
		}

		if (flowCheckers.has(this)) {
			throw new FLOW_CHECKER_REDEFINITION;
		}

		flowCheckers.set(this, cb);

	},
};
