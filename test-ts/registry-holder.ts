'use strict';

// Type-level test for the new typed registry holders.
// This file is compile-only; it does not need to run.

import {
	mnemonica,
	createTypesCollection,
	defaultTypes,
} from '..';

// --- Shape definitions (exported for cross-file registry usage) ---

export interface UserShape {
	name: string;
}

export interface AdminShape extends UserShape {
	role: string;
}

interface SuperAdminShape extends AdminShape {
	level: number;
}

interface GuestShape extends UserShape {
	token: string;
}

// --- Deeper chain shapes ---

interface CountryShape {
	countryCode: string;
}

interface StateShape extends CountryShape {
	stateCode: string;
}

interface CityShape extends StateShape {
	cityName: string;
}

interface DistrictShape extends CityShape {
	districtName: string;
}

interface OrderShape {
	orderId: string;
}

interface LineItemShape {
	sku: string;
	qty: number;
}

// --- Default collection via the mnemonica builder ---

export const DefaultApp = mnemonica
	.define('User', function (this: UserShape, data: { name: string }) {
		this.name = data.name;
	})
	.define('Admin', function (this: AdminShape, data: { role: string }) {
		this.name = 'admin';
		this.role = data.role;
	})
	.define('SuperAdmin', function (this: SuperAdminShape, data: { level: number }) {
		this.name = 'super';
		this.role = 'superadmin';
		this.level = data.level;
	});

const UserFromDefault = DefaultApp.lookup('User');
const user = new UserFromDefault({ name: 'Ada' });
const userName = user.name;

// The constructor returned by `.lookup('User')` is typed so that its instances
// carry the registered subtypes. This makes the idiomatic `new user.Admin(...)`
// fully typed without any TypeRegistry augmentation, including deeper nesting.
const admin = new user.Admin({ role: 'root' });
const adminRole = admin.role;

const superAdmin = new admin.SuperAdmin({ level: 9 });
const superAdminLevel = superAdmin.level;

// defaultTypes (the runtime singleton) can also be used directly;
// its static type is the empty collection, so typed lookups go through
// the builder result above.
const alsoUser = defaultTypes.lookup('User'); // TypeClass | undefined fallback
void alsoUser;

// --- Additional (custom) collection ---

const AdditionalApp = createTypesCollection()
	.define('Order', function (this: OrderShape, data: { orderId: string }) {
		this.orderId = data.orderId;
	})
	.define('LineItem', function (this: LineItemShape, data: { sku: string; qty: number }) {
		this.sku = data.sku;
		this.qty = data.qty;
	});

const OrderCtor = AdditionalApp.lookup('Order');
const order = new OrderCtor({ orderId: '123' });
const orderId = order.orderId;

const lineItem = new order.LineItem({ sku: 'ABC', qty: 5 });
const qty = lineItem.qty;

// A constructor's own `lookup()` is relative to its type path, so these are
// equivalent to `AdditionalApp.lookup('Order.LineItem')` and
// `DefaultApp.lookup('User.Admin')`.
const RelativeLineItemCtor = OrderCtor.lookup('LineItem');
const relativeLineItemQty = RelativeLineItemCtor.prototype.qty;

const RelativeAdminCtor = DefaultApp.lookup('User').lookup('Admin');
const relativeAdminRole = RelativeAdminCtor.prototype.role;

// --- Collection isolation ---

// DefaultApp knows User and User.Admin, not Order.
const isolatedUserName = DefaultApp.lookup('User').prototype.name;
void isolatedUserName;

// AdditionalApp knows Order and Order.LineItem, not User.
const isolatedLineItemQty = AdditionalApp.lookup('Order.LineItem').prototype.qty;
void isolatedLineItemQty;

// --- Chaining on a constructor returned from a collection ---

const ChainedApp = createTypesCollection()
	.define('Catalog', function (this: { title: string }, data: { title: string }) {
		this.title = data.title;
	});

const CatalogCtor = ChainedApp.lookup('Catalog');
const catalog = new CatalogCtor({ title: 'Books' });
const catalogTitle = catalog.title;

// --- Defining subtypes on a looked-up root constructor ---

// It is also valid to look up a root constructor and call `.define()` on it
// directly. The call below registers `User.Guest` in the runtime collection.
DefaultApp.lookup('User').define('Guest', function (this: GuestShape, data: { token: string }) {
	this.name = 'guest';
	this.token = data.token;
});

// --- Deeper chains with intermediate variables ---

// Build a 4-level hierarchy by chaining relative `.define()` calls.
// The final returned object carries the full registry, so root lookups and
// relative lookups through intermediate constructors are both typed.
const GeoApp = createTypesCollection()
	.define('Country', function (this: CountryShape, data: { countryCode: string }) {
		this.countryCode = data.countryCode;
	})
	.define('State', function (this: StateShape, data: { stateCode: string }) {
		this.stateCode = data.stateCode;
	})
	.define('City', function (this: CityShape, data: { cityName: string }) {
		this.cityName = data.cityName;
	})
	.define('District', function (this: DistrictShape, data: { districtName: string }) {
		this.districtName = data.districtName;
	});

// Intermediate constructor variables obtained via relative lookups.
const CountryCtor = GeoApp.lookup('Country');
const StateCtor = CountryCtor.lookup('State');
const CityCtor = StateCtor.lookup('City');
const DistrictCtor = CityCtor.lookup('District');

// Instance-level subtype access through the whole chain.
const country = new CountryCtor({ countryCode: 'US' });
const state = new country.State({ stateCode: 'CA' });
const city = new state.City({ cityName: 'LA' });
const district = new city.District({ districtName: 'Downtown' });

const stateCode = state.stateCode;
const cityName = city.cityName;
const districtName = district.districtName;

// Relative lookups through intermediate constructors are equivalent to full-path
// lookups on the collection.
const StateFromCountry = CountryCtor.lookup('State');
const CityFromState = StateFromCountry.lookup('City');
const DistrictFromCity = CityFromState.lookup('District');
const DistrictFromFull = GeoApp.lookup('Country.State.City.District');

const stateFromRelative = new StateFromCountry({ stateCode: 'NY' });
const cityFromRelative = new CityFromState({ cityName: 'NYC' });
const districtFromRelative = new DistrictFromCity({ districtName: 'Midtown' });
const districtFromFull = new DistrictFromFull({ districtName: 'Uptown' });

console.log(
	userName,
	adminRole,
	superAdminLevel,
	orderId,
	qty,
	relativeLineItemQty,
	relativeAdminRole,
	catalogTitle,
	stateCode,
	cityName,
	districtName,
	stateFromRelative.stateCode,
	cityFromRelative.cityName,
	districtFromRelative.districtName,
	districtFromFull.districtName
);
