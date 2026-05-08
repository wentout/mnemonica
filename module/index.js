// ESM wrapper for mnemonica.
// Re-exports the CommonJS build under named ESM exports.

let mnemonicaModule;
try {
	mnemonicaModule = await import('../build/index.js');
} catch (err) {
	if (err && err.code === 'ERR_MODULE_NOT_FOUND') {
		throw new Error(
			'mnemonica: ../build/index.js not found. ' +
			'If you installed from a Git checkout, run `npm run build` first.'
		);
	}
	throw err;
}

// Use the module namespace directly, not .default — the CJS build's named
// exports are on the module object, and .default may be a synthetic export
// that lacks some properties (e.g., getProps) in certain ESM loaders.
const m = mnemonicaModule;

// Bind functions to undefined so ESM calls don't pass the module namespace as `this`.
// The CJS build's `define()`/`lookup()` use `this` to detect call context; passing
// the ESM namespace object causes `checkThis()` to return false and then `this ||
// defaultTypes` picks the namespace object (which has `.define` pointing back).
export const define = m.define.bind(undefined);
export const lookup = m.lookup.bind(undefined);
export const lookupTyped = m.lookupTyped.bind(undefined);
export const apply = m.apply.bind(undefined);
export const call = m.call.bind(undefined);
export const bind = m.bind.bind(undefined);
export const decorate = m.decorate.bind(undefined);
export const registerHook = m.registerHook.bind(undefined);

export const mnemonica = m.mnemonica;
export const utils = m.utils;
export const defaultCollection = m.defaultCollection;
export const defaultTypes = m.defaultTypes;

export const getProps = m.getProps;
export const setProps = m.setProps;
export const isClass = m.isClass;
export const findSubTypeFromParent = m.findSubTypeFromParent;
export const errors = m.errors;
export const defineStackCleaner = m.defineStackCleaner;
export const createTypesCollection = m.createTypesCollection;

export default m;
