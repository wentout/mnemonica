// ESM wrapper for mnemonica.
// Re-exports the CommonJS build under named ESM exports.

let mnemonicaMod;
try {
	mnemonicaMod = await import('../build/index.js');
} catch (err) {
	if (err && err.code === 'ERR_MODULE_NOT_FOUND') {
		throw new Error(
			'mnemonica: ../build/index.js not found. ' +
			'If you installed from a Git checkout, run `npm run build` first.'
		);
	}
	throw err;
}

const m = mnemonicaMod.default || mnemonicaMod;

export const define = m.define;
export const lookup = m.lookup;
export const lookupTyped = m.lookupTyped;
export const apply = m.apply;
export const call = m.call;
export const bind = m.bind;
export const decorate = m.decorate;
export const registerHook = m.registerHook;

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

export default m;
