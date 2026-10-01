// B4 — createTypesCollection() builder chain, exported, with lookup()
// results and an instance built from a parent instance — the same
// precision pins as B1-B3. Empirical check: do collections emit
// declarations on TS 6 like the default-collection builder?
import { createTypesCollection } from 'mnemonica';

interface WidgetShape { size : number }
interface GadgetShape extends WidgetShape { weight : number }

export const App = createTypesCollection({})
	.define('Widget', function (this : WidgetShape, size : number) {
		this.size = size;
	})
	.define('Gadget', function (this : GadgetShape, weight : number) {
		this.weight = weight;
	});

export const Widget = App.lookup('Widget');
const widget = new Widget(1);
export const gadget = new widget.Gadget(2);
export const pinnedWeight : number = gadget.weight;
export const pinnedSize : number = gadget.size;
