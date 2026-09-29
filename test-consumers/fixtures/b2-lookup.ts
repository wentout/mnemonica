// B2 — export App.lookup('Widget') result; pin the RELATIVE lookup
// (Widget.lookup('Gadget')) and the call form r.A().
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

export const Widget = App.lookup('Widget');

// relative lookup from the looked-up constructor stays typed
export const Gadget = Widget.lookup('Gadget');
const gadget = new Gadget(3);
export const pinnedWeight : number = gadget.weight;

// call form: r.A() — the looked-up constructor is directly new-able
export const called = new (Widget.lookup('Gadget'))(4);
export const calledWeight : number = called.weight;
