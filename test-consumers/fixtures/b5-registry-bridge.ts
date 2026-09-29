// B5 — RegistryOf bridge: a COLLECTION builder's registry merged into the
// global TypeRegistry via the PUBLIC RegistryOf name, then the free
// lookup() exported. (A FREE-define bridge is invalid even today —
// RegistryOf<typeof FreeBuilder> is GlobalRegistry-recursive, TS2310 —
// that itself is a finding.) RegistryOf<typeof App> drags the builder
// registry's internal entry shape (SP1: expected FAIL; must become
// portable through the rework).
import { createTypesCollection, lookup, type RegistryOf } from 'mnemonica';

interface WidgetShape { size : number }

const App = createTypesCollection({})
	.define('Widget', function (this : WidgetShape, size : number) {
		this.size = size;
	});

declare module 'mnemonica' {
	interface TypeRegistry extends RegistryOf<typeof App> {}
}

export const Widget = lookup('Widget');
const w = new Widget(1);
export const pinnedSize : number = w.size;
