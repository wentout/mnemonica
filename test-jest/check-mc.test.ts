import { mnemonica } from '../src/index';

test('check defaultMC', () => {
	const { defaultOptions: { ModificationConstructor: defaultMC } } = mnemonica;
	console.log('typeof defaultMC:', typeof defaultMC);
	console.log('instanceof Function:', defaultMC instanceof Function);
	expect(typeof defaultMC).toBe('function');
});
