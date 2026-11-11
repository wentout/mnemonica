// B6 — RegistryOf bridge with the FREE lookup(): export a subtype
// constructor and an instance reached from the free-looked-up parent,
// with the subtype's own field pinned.
import { mnemonica, lookup, type RegistryOf } from 'mnemonica';

type BridgeWidgetShape = { size : number };
type BridgeGadgetShape = BridgeWidgetShape & { weight : number };

const App = mnemonica
	.define('FreeBridgeWidget', function (this : BridgeWidgetShape, size : number) {
		this.size = size;
	})
	.define('FreeBridgeGadget', function (this : BridgeGadgetShape, weight : number) {
		this.weight = weight;
	});

declare module 'mnemonica' {
	interface TypeRegistry extends RegistryOf<typeof App> {}
}

const Widget = lookup('FreeBridgeWidget');
const widget = new Widget(1);
export const Gadget = widget.FreeBridgeGadget;
export const gadget = new widget.FreeBridgeGadget(2);
export const pinnedWeight : number = gadget.weight;
