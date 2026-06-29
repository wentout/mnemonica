'use strict';

import { createTypesCollection, mnemonica } from 'mnemonica';

interface UserShape {
	name: string;
}

interface AdminShape extends UserShape {
	role: string;
}

// --- Deeper chain shapes ---

interface ProductShape {
	productId: string;
}

interface CategoryShape extends ProductShape {
	categoryId: string;
}

interface ItemShape extends CategoryShape {
	itemId: string;
}

interface VariantShape extends ItemShape {
	variantId: string;
}

// --- Custom collection builder ---

const App = createTypesCollection()
	.define('User', function (this: UserShape, data: { name: string }) {
		this.name = data.name;
	})
	.define('Admin', function (this: AdminShape, data: { role: string }) {
		this.name = 'admin';
		this.role = data.role;
	});

const UserCtor = App.lookup('User');
const user = new UserCtor({ name: 'Ada' });
const userName = user.name;

// Subtypes must be constructed from a parent instance, not from lookup().
const admin = new user.Admin({ role: 'root' });
const adminName = admin.name;
const adminRole = admin.role;

// --- Default collection builder via mnemonica object ---

const Sys = mnemonica
	.define('User', function (this: UserShape, data: { name: string }) {
		this.name = data.name;
	})
	.define('Admin', function (this: AdminShape, data: { role: string }) {
		this.name = 'sysadmin';
		this.role = data.role;
	});

const SysUserCtor = Sys.lookup('User');
const sysUser = new SysUserCtor({ name: 'Bob' });
const sysAdmin = new sysUser.Admin({ role: 'super' });
const sysAdminRole = sysAdmin.role;

// --- Deeper chain with intermediate variables ---

// Build a 4-level hierarchy by chaining relative `.define()` calls.
const ProductApp = createTypesCollection()
	.define('Product', function (this: ProductShape, data: { productId: string }) {
		this.productId = data.productId;
	})
	.define('Category', function (this: CategoryShape, data: { categoryId: string }) {
		this.categoryId = data.categoryId;
	})
	.define('Item', function (this: ItemShape, data: { itemId: string }) {
		this.itemId = data.itemId;
	})
	.define('Variant', function (this: VariantShape, data: { variantId: string }) {
		this.variantId = data.variantId;
	});

// Intermediate constructor variables obtained via relative lookups.
const ProductCtor = ProductApp.lookup('Product');
const CategoryCtor = ProductCtor.lookup('Category');
const ItemCtor = CategoryCtor.lookup('Item');
const VariantCtor = ItemCtor.lookup('Variant');

const product = new ProductCtor({ productId: 'P1' });
const category = new product.Category({ categoryId: 'C1' });
const item = new category.Item({ itemId: 'I1' });
const variant = new item.Variant({ variantId: 'V1' });

const categoryId = category.categoryId;
const itemId = item.itemId;
const variantId = variant.variantId;

// Relative lookups on intermediate constructors and full-path lookup are equivalent.
const CategoryFromProduct = ProductCtor.lookup('Category');
const ItemFromCategory = CategoryFromProduct.lookup('Item');
const VariantFromItem = ItemFromCategory.lookup('Variant');
const VariantFromFull = ProductApp.lookup('Product.Category.Item.Variant');

const categoryFromRelative = new CategoryFromProduct({ categoryId: 'C2' });
const itemFromRelative = new ItemFromCategory({ itemId: 'I2' });
const variantFromRelative = new VariantFromItem({ variantId: 'V2' });
const variantFromFull = new VariantFromFull({ variantId: 'V3' });

console.log(
	userName,
	adminName,
	adminRole,
	sysAdminRole,
	categoryId,
	itemId,
	variantId,
	categoryFromRelative.categoryId,
	itemFromRelative.itemId,
	variantFromRelative.variantId,
	variantFromFull.variantId
);
