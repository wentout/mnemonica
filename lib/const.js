'use strict';

const odp = Object.defineProperty;

// names
const
	DEFAULT_NAMESPACE_NAME = 'default';

// errors
const
	TYPENAME_MUST_BE_A_STRING = 'typename must be a string',
	HANDLER_MUST_BE_A_FUNCTION = 'handler must be a function',
	WRONG_TYPE_DEFINITION = 'wrong type definition';

module.exports = {
	
	// ioc
	odp,
	
	// constants
	DEFAULT_NAMESPACE_NAME,
	
	// errors
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
	
};