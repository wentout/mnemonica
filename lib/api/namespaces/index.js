'use strict';


const api = {
	registerHook : require('./registerHook'),
	registerFlowChecker : require('./registerFlowChecker'),
	invokeHook : require('./invokeHook'),
};

module.exports = {
	...api
};