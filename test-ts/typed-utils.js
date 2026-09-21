'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TypeScript type tests for Phase A generic public utilities.
 * These compile-time assertions verify that extract/pick/clone/fork/parent
 * infer their types from the instance argument without explicit `<T>` casts.
 */
const __1 = require("..");
const UserType = (0, __1.define)('TypedUtilsUser', function () {
    this.name = 'Alice';
    this.email = 'alice@example.com';
    this.age = 30;
});
const user = new UserType();
// A sibling type in the same collection, used for sibling lookup tests
const SiblingType = (0, __1.define)('TypedUtilsSibling', function () {
    this.role = 'sibling';
});
// ============================================================
// utils.extract
// ============================================================
const extracted = __1.utils.extract(user);
// extracted keys keep their original types (methods are filtered out)
const extractedName = extracted.name;
const extractedEmail = extracted.email;
const extractedAge = extracted.age;
// @ts-expect-error - MnemonicaInstance methods are not part of extracted
const _extractedMethod = extracted.extract;
// @ts-expect-error - numeric keys are not part of Extracted<T>
const _wrongKey = extracted[0];
// ============================================================
// instance.extract
// ============================================================
// @ts-expect-error - MnemonicaInstance methods are not part of extracted
const instanceExtracted = user.extract();
const instanceExtractedName = instanceExtracted.name;
const _instanceExtractedMethod = instanceExtracted.pick;
// ============================================================
// utils.pick
// ============================================================
// generic overload: literal keys produce Pick<T, K>
const picked = __1.utils.pick(user, 'name', 'email');
const pickedName = picked.name;
const pickedEmail = picked.email;
// @ts-expect-error - 'email' was not picked
const _notPicked = picked.age;
// loose overload: dynamic keys still compile and return Record<string, unknown>
const dynamicKeys = ['name', 'age'];
const dynamicPicked = __1.utils.pick(user, ...dynamicKeys);
const dynamicName = dynamicPicked.name;
// ============================================================
// instance.pick — moved to utils.pick; NOT part of the instance type
// ============================================================
// @ts-expect-error - instance methods moved to utils (see utils.pick above)
const instancePicked = user.pick('name', 'age');
const instancePickedAge = instancePicked.age;
// ============================================================
// utils.clone
// ============================================================
const cloned = __1.utils.clone(user);
const clonedName = cloned.name;
const clonedAge = cloned.age;
// ============================================================
// instance.clone — moved to utils.clone; NOT part of the instance type
// ============================================================
// @ts-expect-error - instance methods moved to utils (see utils.clone above)
const instanceCloned = user.clone;
const instanceClonedName = instanceCloned.name;
// ============================================================
// utils.fork
// ============================================================
const forkConstructor = __1.utils.fork(user);
const forked = forkConstructor.call(user);
const forkedName = forked.name;
const forkedEmail = forked.email;
// ============================================================
// instance.fork — moved to utils.fork; NOT part of the instance type
// ============================================================
// @ts-expect-error - instance methods moved to utils (see utils.fork above)
const instanceForked = user.fork();
const instanceForkedAge = instanceForked.age;
// ============================================================
// utils.sibling
// ============================================================
const siblingAccessor = __1.utils.sibling(user);
const siblingByCall = siblingAccessor('TypedUtilsSibling');
const siblingByProp = siblingAccessor.TypedUtilsSibling;
// returns TypeClass | undefined, so it is constructable
const siblingInstance = siblingByCall ? new siblingByCall() : undefined;
const siblingInstanceObject = siblingInstance;
// @ts-expect-error - sibling lookup requires a string name
const _wrongSiblingArg = siblingAccessor(123);
// ============================================================
// instance.sibling — moved to utils.sibling; NOT part of the instance type
// ============================================================
// @ts-expect-error - instance methods moved to utils (see utils.sibling above)
const instanceSibling = user.sibling('TypedUtilsSibling');
// @ts-expect-error - instance methods moved to utils (see utils.sibling above)
const instanceSiblingByProp = user.sibling.TypedUtilsSibling;
const instanceSiblingInstance = instanceSibling ? new instanceSibling() : undefined;
// reverse lookup: from a sibling instance back to the original type
const siblingInstance2 = new SiblingType();
const reverseSiblingAccessor = __1.utils.sibling(siblingInstance2);
const reverseSiblingByCall = reverseSiblingAccessor('TypedUtilsUser');
// ============================================================
// utils.parent
// ============================================================
const userParent = __1.utils.parent(user);
const userParentOptional = userParent;
// with path argument
const userParentByPath = __1.utils.parent(user, 'TypedUtilsUser');
const userParentByPathOptional = userParentByPath;
// ============================================================
// instance.parent — moved to utils.parent; NOT part of the instance type
// ============================================================
// @ts-expect-error - instance methods moved to utils (see utils.parent above)
const instanceParent = user.parent();
const instanceParentOptional = instanceParent;
// ============================================================
// apply / call / bind
// ============================================================
const AdminType = UserType.define('TypedUtilsAdmin', function () {
    this.name = 'Admin';
    this.level = 1;
});
const adminApply = (0, __1.apply)(user, AdminType);
const adminApplyName = adminApply.name;
const adminApplyLevel = adminApply.level;
const adminCall = (0, __1.call)(user, AdminType);
const adminCallName = adminCall.name;
const adminBind = (0, __1.bind)(user, AdminType)();
const adminBindLevel = adminBind.level;
// @ts-expect-error - 'nonexistent' is not part of the merged Admin instance
const _notOnAdmin = adminApply.nonexistent;
// ============================================================
// utils.merge
// ============================================================
const merged = __1.utils.merge(user, siblingInstance2);
const mergedName = merged.name;
const mergedRole = merged.role;
// ============================================================
// utils.parse
// ============================================================
const parsed = __1.utils.parse(user);
const parsedName = parsed.name;
const parsedPropsName = parsed.props.name;
const parsedSelf = parsed.self;
const parsedParent = parsed.parent;
// ============================================================
// utils.toJSON
// ============================================================
const userJson = __1.utils.toJSON(user);
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
