'use strict';

// names
const MNEMONICA = 'Mnemonica';

// O Great Mnemosyne! Please!
// Save us from Oblivion...
// https://en.wikipedia.org/wiki/Mnemosyne
const MNEMOSYNE = 'Mnemosyne';

// Gaia - Wikipedia
// https://en.wikipedia.org/wiki/Gaia
const GAIA = 'Gaia';
const URANUS = 'Uranus';


// symbols
const SymbolDefaultNamespace = Symbol( `default ${MNEMONICA} namespace` );
const SymbolDefaultTypesCollection = Symbol( `default ${MNEMONICA} types collection` );
const SymbolSubtypeCollection = Symbol( 'SubType Collection' );
const SymbolConstructorName = Symbol( 'Defined Constructor Name' );
const SymbolGaia = Symbol( 'Defined Gaia Constructor' );
const SymbolReplaceGaia = Symbol( 'Defined Method Name to Replace Gaia' );

const SymbolConfig = Symbol( 'Mnemonica Config Data' );

// etc...
const TYPE_TITLE_PREFIX = 'modificator of : ';

// errors
const ErrorMessages = {

	BASE_ERROR_MESSAGE: 'UNPREDICTABLE BEHAVIOUR',
	TYPENAME_MUST_BE_A_STRING: 'typename must be a string',
	HANDLER_MUST_BE_A_FUNCTION: 'handler must be a function',
	WRONG_TYPE_DEFINITION: 'wrong type definition',
	WRONG_INSTANCE_INVOCATION: 'wrong instance invocation',
	WRONG_MODIFICATION_PATTERN: 'wrong modification pattern',
	ALREADY_DECLARED: 'this type has already been declared',
	// EXISTENT_PROPERTY_REDEFINITION : 'attempt to re-define type constructor',
	WRONG_ARGUMENTS_USED: 'wrong arguments : should use proper invocation',
	WRONG_HOOK_TYPE: 'this hook type does not exist',
	MISSING_HOOK_CALLBACK: 'hook definition requires callback',
	MISSING_CALLBACK_ARGUMENT: 'callback is required argument',
	FLOW_CHECKER_REDEFINITION: 'attempt to re-define flow checker callback',
	NAMESPACE_DOES_NOT_EXIST: 'namespace does not exits',
	ASSOCIATION_EXISTS: 'association is already made',
	OPTIONS_ERROR: 'options must be an object or a string',
	WRONG_STACK_CLEANER: 'wrong stack cleaner instanceof'
};

export const constants = {

	get 'SymbolSubtypeCollection' () {
		return SymbolSubtypeCollection;
	},

	get 'SymbolConstructorName' () {
		return SymbolConstructorName;
	},

	get 'SymbolGaia' () {
		return SymbolGaia;
	},

	get 'SymbolReplaceGaia' () {
		return SymbolReplaceGaia;
	},

	get 'SymbolDefaultNamespace' () {
		return SymbolDefaultNamespace;
	},

	get 'SymbolDefaultTypesCollection' () {
		return SymbolDefaultTypesCollection;
	},

	get 'SymbolConfig' () {
		return SymbolConfig;
	},

	// constants
	get 'MNEMONICA' () {
		return MNEMONICA;
	},
	get 'MNEMOSYNE' () {
		return MNEMOSYNE;
	},
	get 'GAIA' () {
		return GAIA;
	},
	get 'URANUS' () {
		return URANUS;
	},
	get 'odp' () {
		return ( o: any, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any> ): any => {
			return Object.defineProperty( o, p, attributes );
		};
	},

	TYPE_TITLE_PREFIX,

	ErrorMessages,

};
