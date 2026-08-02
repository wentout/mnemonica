'use strict';

const { assert } = require('chai');
const { createTypesCollection, decorate } = require('..');

describe('custom collection decorate', () => {

	it('collection.decorate() registers a root type in the collection', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate()(class User {
			constructor (data) {
				this.name = data.name;
			}
		});

		assert.strictEqual(MyCollection.lookup('User'), User);

		const user = new User({ name : 'John' });
		assert.strictEqual(user.name, 'John');
	});

	it('decorate(parentFromCollection) registers a subtype in the same collection', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate()(class User {
			constructor (data) {
				this.name = data.name;
			}
		});

		const Admin = decorate(User)(class Admin {
			constructor (data) {
				this.role = data.role;
			}
		});

		assert.strictEqual(MyCollection.lookup('User.Admin'), Admin);

		const user = new User({ name : 'John' });
		const admin = new user.Admin({ role : 'root' });

		assert.strictEqual(admin.name, 'John');
		assert.strictEqual(admin.role, 'root');
		assert.instanceOf(admin, User);
	});

	it('collection.decorate(config) passes config to the created type', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate({ strictChain : false })(class User {
			constructor (data) {
				this.name = data.name;
			}
		});

		assert.strictEqual(MyCollection.lookup('User'), User);
	});

});
