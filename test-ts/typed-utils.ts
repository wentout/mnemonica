'use strict';

/**
 * TypeScript type tests for Phase A generic public utilities.
 * These compile-time assertions verify that extract/pick/clone/fork/parent
 * infer their types from the instance argument without explicit `<T>` casts.
 */

import { define, apply, call, bind, utils } from '..';

const UserType = define('TypedUtilsUser', function (this: {
	name: string;
	email: string;
	age: number;
}) {
	this.name = 'Alice';
	this.email = 'alice@example.com';
	this.age = 30;
});

const user = new UserType();

// A sibling type in the same collection, used for sibling lookup tests
const SiblingType = define('TypedUtilsSibling', function (this: {
	role: string;
}) {
	this.role = 'sibling';
});

// ============================================================
// utils.extract
// ============================================================

const extracted = utils.extract(user);

// extracted keys keep their original types (methods are filtered out)
const extractedName: string = extracted.name;
const extractedEmail: string = extracted.email;
const extractedAge: number = extracted.age;

// @ts-expect-error - MnemonicaInstance methods are not part of extracted
const _extractedMethod = extracted.extract;

// @ts-expect-error - numeric keys are not part of Extracted<T>
const _wrongKey = extracted[0];

// ============================================================
// instance.extract
// ============================================================

// @ts-expect-error - MnemonicaInstance methods are not part of extracted
const instanceExtracted = user.extract();
const instanceExtractedName: string = instanceExtracted.name;

const _instanceExtractedMethod = instanceExtracted.pick;

// ============================================================
// utils.pick
// ============================================================

// generic overload: literal keys produce Pick<T, K>
const picked = utils.pick(user, 'name', 'email');
const pickedName: string = picked.name;
const pickedEmail: string = picked.email;

// @ts-expect-error - 'email' was not picked
const _notPicked: number = picked.age;

// loose overload: dynamic keys still compile and return Record<string, unknown>
const dynamicKeys = ['name', 'age'] as string[];
const dynamicPicked = utils.pick(user, ...dynamicKeys);
const dynamicName: unknown = dynamicPicked.name;

// ============================================================
// instance.pick
// ============================================================

const instancePicked = user.pick('name', 'age');
const instancePickedAge: number = instancePicked.age;

// ============================================================
// utils.clone
// ============================================================

const cloned = utils.clone(user);
const clonedName: string = cloned.name;
const clonedAge: number = cloned.age;

// ============================================================
// instance.clone
// ============================================================

const instanceCloned = user.clone;
const instanceClonedName: string = instanceCloned.name;

// ============================================================
// utils.fork
// ============================================================

const forkConstructor = utils.fork(user);
const forked = forkConstructor.call(user);
const forkedName: string = forked.name;
const forkedEmail: string = forked.email;

// ============================================================
// instance.fork
// ============================================================

const instanceForked = user.fork();
const instanceForkedAge: number = instanceForked.age;

// ============================================================
// utils.sibling
// ============================================================

const siblingAccessor = utils.sibling(user);
const siblingByCall = siblingAccessor('TypedUtilsSibling');
const siblingByProp = siblingAccessor.TypedUtilsSibling;

// returns TypeClass | undefined, so it is constructable
const siblingInstance = siblingByCall ? new siblingByCall() : undefined;
const siblingInstanceObject: object | undefined = siblingInstance;

// @ts-expect-error - sibling lookup requires a string name
const _wrongSiblingArg = siblingAccessor(123);

// ============================================================
// instance.sibling
// ============================================================

const instanceSibling = user.sibling('TypedUtilsSibling');
const instanceSiblingByProp = user.sibling.TypedUtilsSibling;
const instanceSiblingInstance = instanceSibling ? new instanceSibling() : undefined;

// reverse lookup: from a sibling instance back to the original type
const siblingInstance2 = new SiblingType();
const reverseSiblingAccessor = utils.sibling(siblingInstance2);
const reverseSiblingByCall = reverseSiblingAccessor('TypedUtilsUser');

// ============================================================
// utils.parent
// ============================================================

const userParent = utils.parent(user);
const userParentOptional: object | undefined = userParent;

// with path argument
const userParentByPath = utils.parent(user, 'TypedUtilsUser');
const userParentByPathOptional: object | undefined = userParentByPath;

// ============================================================
// instance.parent
// ============================================================

const instanceParent = user.parent();
const instanceParentOptional: object | undefined = instanceParent;

// ============================================================
// apply / call / bind
// ============================================================

const AdminType = UserType.define('TypedUtilsAdmin', function (this: {
	name: string;
	level: number;
}) {
	this.name = 'Admin';
	this.level = 1;
});

const adminApply = apply(user, AdminType);
const adminApplyName: string = adminApply.name;
const adminApplyLevel: number = adminApply.level;

const adminCall = call(user, AdminType);
const adminCallName: string = adminCall.name;

const adminBind = bind(user, AdminType)();
const adminBindLevel: number = adminBind.level;

// @ts-expect-error - 'nonexistent' is not part of the merged Admin instance
const _notOnAdmin: string = adminApply.nonexistent;

// ============================================================
// utils.merge
// ============================================================

const merged = utils.merge(user, siblingInstance2);
const mergedName: string = merged.name;
const mergedRole: string = merged.role;

// ============================================================
// utils.parse
// ============================================================

const parsed = utils.parse(user);
const parsedName: string = parsed.name;
const parsedPropsName: string = parsed.props.name;
const parsedSelf: typeof user = parsed.self;
const parsedParent: object | undefined = parsed.parent;

// ============================================================
// utils.toJSON
// ============================================================

const userJson: string = utils.toJSON(user);

console.log({
	extractedName,
	extractedEmail,
	extractedAge,
	_extractedMethod,
	instanceExtractedName,
	_instanceExtractedMethod,
	_wrongKey,
	pickedName,
	pickedEmail,
	_notPicked,
	dynamicName,
	instancePickedAge,
	clonedName,
	clonedAge,
	instanceClonedName,
	forkedName,
	forkedEmail,
	instanceForkedAge,
	siblingByCall,
	siblingByProp,
	siblingInstanceObject,
	_wrongSiblingArg,
	instanceSibling,
	instanceSiblingByProp,
	instanceSiblingInstance,
	reverseSiblingByCall,
	userParentOptional,
	userParentByPathOptional,
	instanceParentOptional,
	adminApplyName,
	adminApplyLevel,
	adminCallName,
	adminBindLevel,
	_notOnAdmin,
	mergedName,
	mergedRole,
	parsedName,
	parsedPropsName,
	parsedSelf,
	parsedParent,
	userJson
});
