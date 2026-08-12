// npx tsc --ignoreConfig --target ES2021 --moduleResolution NodeNext --module NodeNext --sourceMap ./test/decorate-builder.ts

// Minimal builder-node decorate test: subtype defined from a builder-defined parent,
// including @Strict from typeomatica combined with the builder-node decorator.

import { mnemonica } from '..';
import { Strict } from 'typeomatica';

const BuilderUserType = mnemonica.define('BuilderUserType', function (this: { name: string }) {
	this.name = 'builder';
});
const { decorate: builderUserDecorator } = BuilderUserType;

class BuilderAdminType {
	role: string;
	constructor () {
		this.role = 'admin';
	}
}

const BuilderAdminTypeDecorated = builderUserDecorator()(BuilderAdminType);

@builderUserDecorator()
@Strict()
class BuilderStrictAdminType {
	role: string;
	strictField: string;
	constructor () {
		this.role = 'admin';
		this.strictField = 'strict';
	}
}

const builderUserInstance = new BuilderUserType();
const builderAdminInstance = mnemonica.apply(builderUserInstance, BuilderAdminTypeDecorated);
const builderStrictAdminInstance = mnemonica.apply(builderUserInstance, BuilderStrictAdminType);

export { builderUserInstance, builderAdminInstance, builderStrictAdminInstance };
