// B1 — export the builder chain value (mnemonica.define(...).define(...))
// plus a PRECISION pin: the chain's own lookup stays typed.
import { mnemonica } from 'mnemonica';

interface WidgetShape { size : number }
interface GadgetShape extends WidgetShape { weight : number }

export const App = mnemonica
	.define('Widget', function (this : WidgetShape, size : number) {
		this.size = size;
	})
	.define('Gadget', function (this : GadgetShape, weight : number) {
		this.weight = weight;
	});

const Widget = App.lookup('Widget');
const widget = new Widget(1);
const gadget = new widget.Gadget(2);
export const pinnedWeight : number = gadget.weight;
