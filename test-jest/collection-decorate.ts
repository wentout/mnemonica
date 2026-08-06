'use strict';

import { describe, expect, it } from '@jest/globals';

const { createTypesCollection, decorate } = require('../src/index');

describe('custom collection decorate', () => {

	it('collection.decorate() registers a root type in the collection', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate()(class User {
			name: string;
			constructor (data: { name: string }) {
				this.name = data.name;
			}
		});

		expect(MyCollection.lookup('User')).toBe(User);

		const user = new User({ name : 'John' });
		expect(user.name).toBe('John');
	});

	it('decorate(parentFromCollection) registers a subtype in the same collection', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate()(class User {
			name: string;
			constructor (data: { name: string }) {
				this.name = data.name;
			}
		});

		const Admin = decorate(User)(class Admin {
			role: string;
			constructor (data: { role: string }) {
				this.role = data.role;
			}
		});

		expect(MyCollection.lookup('User.Admin')).toBe(Admin);

		const user = new User({ name : 'John' });
		const admin = new user.Admin({ role : 'root' });

		expect(admin.name).toBe('John');
		expect(admin.role).toBe('root');
		expect(admin instanceof User).toBe(true);
	});

	it('collection.decorate(config) passes config to the created type', () => {
		const MyCollection = createTypesCollection();

		const User = MyCollection.decorate({ strictChain : false })(class User {
			name: string;
			constructor (data: { name: string }) {
				this.name = data.name;
			}
		});

		expect(MyCollection.lookup('User')).toBe(User);
	});

});
