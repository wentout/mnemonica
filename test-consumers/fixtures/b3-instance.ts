// B3 — export an instance built via new widget.Gadget(...), pinned.
import { mnemonica } from 'mnemonica';

interface WidgetShape { size : number }
interface GadgetShape extends WidgetShape { weight : number }

const App = mnemonica
	.define('Widget', function (this : WidgetShape, size : number) {
		this.size = size;
	})
	.define('Gadget', function (this : GadgetShape, weight : number) {
		this.weight = weight;
	});

const Widget = App.lookup('Widget');
const widget = new Widget(1);
export const gadget = new widget.Gadget(2);
export const pinnedWeight : number = gadget.weight;
export const pinnedSize : number = gadget.size;   // inherited through the chain
