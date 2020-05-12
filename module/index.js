
import mnemonica from '../build/index.js';

export default mnemonica;

export const {
	errors,
	ErrorMessages,

	// constants: strings
	MNEMONICA,
	MNEMOSYNE,
	GAIA,
	URANUS,

	TYPE_TITLE_PREFIX,

	// constants: symbols
	SymbolConstructorName,
	SymbolSubtypeCollection,
	SymbolGaia,

	// namespaces
	namespaces,
	defaultNamespace,
	createNamespace,
	SymbolDefaultNamespace,

	// types collections
	defaultTypes,
	createTypesCollection,
	
	defineStackCleaner,
	
	utils,
	
	// main
	define,
	lookup

} = mnemonica;
