// ESM wrapper for mnemonica
// This module re-exports everything from the CommonJS build

// Use dynamic import to load CommonJS module
const mnemonicaMod = await import('../build/index.js');

// Handle both ESM default and CommonJS exports patterns
const m = mnemonicaMod.default || mnemonicaMod;

// Re-export all properties as named exports
export const define = m.define;
export const lookup = m.lookup;
export const lookupTyped = m.lookupTyped;
export const apply = m.apply;
export const call = m.call;
export const bind = m.bind;
export const decorate = m.decorate;
export const registerHook = m.registerHook;

// Core objects
export const mnemonica = m.mnemonica;
export const utils = m.utils;
export const defaultCollection = m.defaultCollection;
export const defaultTypes = m.defaultTypes;

// Utils
export const getProps = m.getProps;
export const setProps = m.setProps;
export const isClass = m.isClass;
export const findSubTypeFromParent = m.findSubTypeFromParent;
export const errors = m.errors;
export const defineStackCleaner = m.defineStackCleaner;

// Default export is the whole module
export default m;
