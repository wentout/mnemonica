'use strict';

const odp = Object.defineProperty;

// symbols
const SymbolSubtypeCollection = Symbol('SubType Collection');
const SymbolConstructorName = Symbol('Defined Constructor Name');


// names
const MNEMONICA = 'mnemonica';
const MNEMOSYNE = 'Mnemosyne';
const DEFAULT_NAMESPACE_NAME = 'default';

// etc...
const TYPE_TITLE_PREFIX = 'modificator of : ';

// errors
const ErrorMessages = {
	
	TYPENAME_MUST_BE_A_STRING      : 'typename must be a string',
	HANDLER_MUST_BE_A_FUNCTION     : 'handler must be a function',
	WRONG_TYPE_DEFINITION          : 'wrong type definition',
	WRONG_INSTANCE_INVOCATION      : 'wrong instance invocation',
	WRONG_MODIFICATION_PATTERN     : 'wrong modification pattern',
	ALREADY_DECLARED               : 'this type has already been declared',
	EXISTENT_PROPERTY_REDEFINITION : 'attempt to re-define existent property',
	
};

// ioc
module.exports = {
	
	odp,
	
	get 'SymbolSubtypeCollection' () {
		return SymbolSubtypeCollection;
	},
	get 'SymbolConstructorName' () {
		return SymbolConstructorName;
	},
	
	// constants
	get 'MNEMONICA' () {
		return MNEMONICA;
	},
	get 'MNEMOSYNE' () {
		return MNEMOSYNE;
	},
	get 'DEFAULT_NAMESPACE_NAME' () {
		return DEFAULT_NAMESPACE_NAME;
	},
	
	TYPE_TITLE_PREFIX,
	
	ErrorMessages,
	
};