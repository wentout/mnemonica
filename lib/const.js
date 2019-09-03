'use strict';

const odp = Object.defineProperty;

const MNEMONICA = 'mnemonica';
const MNEMOSYNE = 'Mnemosyne';
const TYPE_TITLE_PREFIX = 'modificator of : ';
const SymbolSubtypeCollection = Symbol('SubType Collection');
const SymbolConstructorName = Symbol('Defined Constructor Name');


// names
const
	DEFAULT_NAMESPACE_NAME = 'default';

// errors
const
	TYPENAME_MUST_BE_A_STRING = 'typename must be a string',
	HANDLER_MUST_BE_A_FUNCTION = 'handler must be a function',
	WRONG_TYPE_DEFINITION = 'wrong type definition',
	WRONG_INSTANCE_INVOCATION = 'wrong instance invocation',
	WRONG_MODIFICATION_PATTERN = 'wrong modification pattern',
	ALREADY_DECLARED = 'this type has already been declared';

module.exports = {
	
	// ioc
	odp,
	SymbolSubtypeCollection,
	SymbolConstructorName,
	
	// constants
	MNEMONICA,
	MNEMOSYNE,
	TYPE_TITLE_PREFIX,
	DEFAULT_NAMESPACE_NAME,
	
	// errors
	TYPENAME_MUST_BE_A_STRING,
	HANDLER_MUST_BE_A_FUNCTION,
	WRONG_TYPE_DEFINITION,
	WRONG_INSTANCE_INVOCATION,
	WRONG_MODIFICATION_PATTERN,
	ALREADY_DECLARED,
	
};