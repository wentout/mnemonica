'use strict';

import { beforeAll, describe, expect, it } from '@jest/globals';
import type { ErrorProps, MnemonicaModule } from '../src/types';
import { withInstanceMethods } from './instance-methods-helper';

const mnemonica = require('../src/index') as MnemonicaModule;

const {
	define,
	errors,
	getProps,
	createTypesCollection,
} = mnemonica;

// Import raw utilities (not wrapped by wrapThis) to test them directly
import { exception } from '../src/utils/exception';
import { sibling } from '../src/utils/sibling';
import { fork } from '../src/utils/fork';
import { clone } from '../src/utils/clone';
import { extract } from '../src/utils/extract';
import { toJSON } from '../src/utils/toJSON';
import { deepParse } from '../src/utils/deepParse';
import { lineage } from '../src/utils/lineage';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ajv2020 = require('ajv/dist/2020');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const letheSchema = require('@mnemonica/lethe/lineage.schema.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const letheFixture = require('@mnemonica/lethe/testdata/lineage/fixture.json');

describe('utils/exception', () => {

	const SomeType = define('ExceptionTestType', withInstanceMethods(function () { }));
	const instance = new SomeType();

	describe('called without new', () => {
		it('should throw WRONG_INSTANCE_INVOCATION', () => {
			expect(() => {
				exception(instance, new Error('test'));
			}).toThrow(errors.WRONG_INSTANCE_INVOCATION);
		});
	});

	describe('called with new', () => {

		it('should throw when error is not instanceof Error', () => {
			expect(() => {
				new (exception as CallableFunction)(instance, 'not an error' as unknown as Error);
			}).toThrow(errors.WRONG_ARGUMENTS_USED);
		});

		it('should create proper exception instance', () => {
			const originalError = new Error('original');
			const exceptionInstance = new (exception as CallableFunction)(
				instance,
				originalError,
				1,
				2,
				3
			);

			expect(exceptionInstance).toBeInstanceOf(Error);
			const exceptionProps = getProps(exceptionInstance) as unknown as ErrorProps;
			expect(exceptionProps.instance).toEqual(instance);
			expect(exceptionProps.originalError).toEqual(originalError);
			expect(exceptionProps.args).toEqual([1, 2, 3]);
		});

		it('should expose no bound methods; use utils on .instance instead', () => {
			const originalError = new Error('original');
			const exceptionInstance = new (exception as CallableFunction)(
				instance,
				originalError
			);

			expect(exceptionInstance.extract).toBeUndefined();
			expect(exceptionInstance.parse).toBeUndefined();
			expect(exceptionInstance.instance).toBeUndefined();
			const exceptionProps = getProps(exceptionInstance) as unknown as ErrorProps;
			expect(extract(exceptionProps.instance as object)).toMatchObject(instance.extract());
		});

	});

});

describe('utils/sibling', () => {

	const CollectionA = define('SiblingTestCollectionA', withInstanceMethods(function () { }));
	const CollectionB = define('SiblingTestCollectionB', withInstanceMethods(function () { }));
	const instanceA = new CollectionA();
	const instanceB = new CollectionB();

	describe('direct call (apply trap)', () => {
		it('should find sibling by name', () => {
			const siblingProxy = sibling(instanceA) as { (name: string): unknown };
			const result = siblingProxy('SiblingTestCollectionB');
			expect(result).toEqual(CollectionB);
		});

		it('should return undefined for missing sibling', () => {
			const siblingProxy = sibling(instanceA) as { (name: string): unknown };
			const result = siblingProxy('NonExistentType');
			expect(result).toBeUndefined();
		});
	});

	describe('property access (get trap)', () => {
		it('should find sibling by property access', () => {
			const siblingProxy = sibling(instanceA) as Record<string, unknown>;
			const result = siblingProxy.SiblingTestCollectionB;
			expect(result).toEqual(CollectionB);
		});

		it('should return undefined for missing sibling property', () => {
			const siblingProxy = sibling(instanceA) as Record<string, unknown>;
			const result = siblingProxy.NonExistentType;
			expect(result).toBeUndefined();
		});
	});

	describe('with different instances', () => {
		it('should return sibling from instanceB collection', () => {
			const siblingProxy = sibling(instanceB) as { (name: string): unknown };
			const result = siblingProxy('SiblingTestCollectionA');
			expect(result).toEqual(CollectionA);
		});
	});

});

	describe('utils/fork', () => {

		const originalData = { value: 'original' };
		const ForkTestType = define('ForkTestType', function (this: { value: string }, data: { value: string }) {
			this.value = data.value;
		});
		const instance = new ForkTestType(originalData);

		describe('fork with original args', () => {
			it('should create fork with original args when called with no args', () => {
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(instance);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('original');
			});
		});

		describe('fork with new args', () => {
			it('should create fork with new args', () => {
				const newData = { value: 'forked' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(instance, newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked');
			});
		});

		describe('fork preserves type', () => {
			it('should preserve instanceof relationship', () => {
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(instance);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect(instance).toBeInstanceOf(ForkTestType);
			});
		});

		describe('fork with different this', () => {
			it('should use InstanceCreator when this is not __self__', () => {
				const OtherType = define('ForkOtherType', function () { });
				const otherInstance = new OtherType();
				const newData = { value: 'forked from other' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(otherInstance, newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked from other');
			});
		});

		describe('fork on subtype', () => {
			it('should fork subtype using existentInstance as Constructor', () => {
				const ParentType = define('ForkParentType', function (this: { parentVal: string }, data: { parentVal: string }) {
					this.parentVal = data.parentVal;
				});
				const SubType = ParentType.define('ForkSubType', function (this: { subVal: string }, data: { subVal: string }) {
					this.subVal = data.subVal;
				});
				const parentInstance = new ParentType({ parentVal: 'parent' });
				const subInstance = new parentInstance.ForkSubType({ subVal: 'sub' });

				const forkFn = fork(subInstance);
				const forked = (forkFn as CallableFunction).call(subInstance);

				expect(forked).toBeInstanceOf(SubType);
				expect((forked as { subVal: string }).subVal).toEqual('sub');
			});
		});

		describe('fork with primitive wrapper this', () => {
			it('should work when called with new Boolean(this)', () => {
				const newData = { value: 'forked with boolean wrapper' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(new Boolean(5), newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked with boolean wrapper');
			});

			it('should work when called with new String(this)', () => {
				const newData = { value: 'forked with string wrapper' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(new String('test'), newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked with string wrapper');
			});

			it('should work when called with new Number(this)', () => {
				const newData = { value: 'forked with number wrapper' };
				const forkFn = fork(instance);
				const forked = (forkFn as CallableFunction).call(new Number(42), newData);

				expect(forked).toBeInstanceOf(ForkTestType);
				expect((forked as { value: string }).value).toEqual('forked with number wrapper');
			});
		});

	});

	describe('utils/clone', () => {

		const originalData = { value: 'original' };
		const CloneTestType = define('CloneTestType', withInstanceMethods(function (this: { value: string }, data: { value: string }) {
			this.value = data.value;
		}));
		const instance = new CloneTestType(originalData);

		describe('clone root type instance', () => {
			it('should create a new instance with original args', () => {
				const cloned = clone(instance);

				expect(cloned).toBeInstanceOf(CloneTestType);
				expect((cloned as { value: string }).value).toEqual('original');
			});

			it('should not return the same reference', () => {
				const cloned = clone(instance);

				expect(cloned).not.toBe(instance);
			});

			it('should preserve instanceof relationship', () => {
				const cloned = clone(instance);

				expect(cloned).toBeInstanceOf(CloneTestType);
				expect(instance).toBeInstanceOf(CloneTestType);
			});

			it('should deep equal the original', () => {
				const cloned = clone(instance);

				expect(cloned).toEqual(instance);
				expect((cloned as { extract: () => object }).extract()).toEqual(instance.extract());
			});
		});

		describe('clone nested subtype instance', () => {
			it('should clone subtype using existentInstance as Constructor', () => {
				const ParentType = define('CloneParentType', withInstanceMethods(function (this: { parentVal: string }, data: { parentVal: string }) {
					this.parentVal = data.parentVal;
				}));
				const SubType = ParentType.define('CloneSubType', function (this: { subVal: string }, data: { subVal: string }) {
					this.subVal = data.subVal;
				});
				const parentInstance = new ParentType({ parentVal: 'parent' });
				const subInstance = new parentInstance.CloneSubType({ subVal: 'sub' });

				const cloned = clone(subInstance);

				expect(cloned).toBeInstanceOf(SubType);
				expect((cloned as { subVal: string }).subVal).toEqual('sub');
				expect(cloned).not.toBe(subInstance);
				expect((cloned as { extract: () => object }).extract()).toEqual(subInstance.extract());
			});
		});

	});

describe('utils/toJSON', () => {

	const ToJsonType = define('ToJsonTestTypeJest', function (this: { str: string; num: number }) {
		this.str = 'value';
		this.num = 123;
	});
	const toJsonInstance = new ToJsonType();

	it('round-trips normal fields', () => {
		const parsedRoundTrip = JSON.parse(toJSON(toJsonInstance)) as { str: string; num: number };
		expect(parsedRoundTrip.str).toEqual('value');
		expect(parsedRoundTrip.num).toEqual(123);
	});

	it('produces {} for no fields at all', () => {
		const EmptyToJsonType = define('EmptyToJsonTestTypeJest', function () {});
		const emptyToJsonInstance = new EmptyToJsonType();
		expect(toJSON(emptyToJsonInstance)).toEqual('{}');
	});

	it('omits null and undefined fields — only-null becomes {}', () => {
		const NullishToJsonType = define('NullishToJsonTestTypeJest', function (this: { nil: null; undef: undefined }) {
			this.nil = null;
			this.undef = undefined;
		});
		const nullishToJsonInstance = new NullishToJsonType();
		expect(toJSON(nullishToJsonInstance)).toEqual('{}');
	});

	it('escapes keys — a quote in a key stays valid JSON', () => {
		const QuotedToJsonType = define('QuotedToJsonTestTypeJest', function (this: Record<string, string>) {
			this['quoted"key'] = 'quoted value';
		});
		const quotedToJsonInstance = new QuotedToJsonType();
		const quotedParsed = JSON.parse(toJSON(quotedToJsonInstance)) as Record<string, string>;
		expect(quotedParsed['quoted"key']).toEqual('quoted value');
	});

	it('replaces an unstringifiable (circular) value with the description object', () => {
		const CircularToJsonType = define('CircularToJsonTestTypeJest', function (this: { self?: unknown }) {
			this.self = this;
		});
		const circularToJsonInstance = new CircularToJsonType();
		const circularParsed = JSON.parse(toJSON(circularToJsonInstance)) as {
			self: { description: string; message: string };
		};
		expect(circularParsed.self.description)
			.toEqual('This value type is not supported by JSON.stringify');
		expect(typeof circularParsed.self.message).toEqual('string');
	});

	it('replaces a function value (stringify returns undefined) with the description object', () => {
		const FnToJsonType = define('FnToJsonTestTypeJest', function (this: { fn: () => void }) {
			this.fn = function () {};
		});
		const fnToJsonInstance = new FnToJsonType();
		const fnParsed = JSON.parse(toJSON(fnToJsonInstance)) as {
			fn: { description: string };
		};
		expect(fnParsed.fn.description)
			.toEqual('This value type is not supported by JSON.stringify');
	});

});

describe('utils/deepParse', () => {

	const DPLevel1 = define('DeepParseLevel1Jest', function () {});
	const DPLevel2 = DPLevel1.define('DeepParseLevel2Jest', function () {});
	const DPLevel3 = DPLevel2.define('DeepParseLevel3Jest', function () {});

	it('walks from the instance to the root in order', () => {
		const dpRoot = new DPLevel1();
		const dpMid = new dpRoot.DeepParseLevel2Jest();
		const dpLeaf = new dpMid.DeepParseLevel3Jest();

		const levels = deepParse(dpLeaf);
		expect(levels.length).toEqual(3);
		expect(levels[0].name).toEqual('DeepParseLevel3Jest');
		expect(levels[1].name).toEqual('DeepParseLevel2Jest');
		expect(levels[2].name).toEqual('DeepParseLevel1Jest');
		expect(levels[0].self).toBe(dpLeaf);
		expect(levels[2].parent).toBeNull();
	});

	it('hops real parent instances, skipping the prototype layers', () => {
		const dpRoot = new DPLevel1();
		const dpLeaf = new (new dpRoot.DeepParseLevel2Jest()).DeepParseLevel3Jest();

		const levels = deepParse(dpLeaf);
		expect(levels[1].self).toBe(levels[0].parent);
		expect(levels[2].self).toBe(levels[1].parent);
	});

	it('works for a single-level (root) instance', () => {
		const dpRoot = new DPLevel1();
		const levels = deepParse(dpRoot);
		expect(levels.length).toEqual(1);
		expect(levels[0].name).toEqual('DeepParseLevel1Jest');
	});

	it('walks chains in a non-default collection', () => {
		const collection = createTypesCollection();
		const CRoot = collection.define('DeepParseCCRootJest', function () {});
		CRoot.define('DeepParseCCSubJest', function () {});
		const ccRoot = new CRoot();
		const ccLeaf = new ccRoot.DeepParseCCSubJest();

		const levels = deepParse(ccLeaf);
		expect(levels.length).toEqual(2);
		expect(levels[0].name).toEqual('DeepParseCCSubJest');
		expect(levels[1].name).toEqual('DeepParseCCRootJest');
		expect(levels[1].self).toBe(ccRoot);
	});

	it('gives a fork a sibling subtree under the SAME parent instance', () => {
		const dpRoot = new DPLevel1();
		const dpMid = new dpRoot.DeepParseLevel2Jest();
		const dpForked = fork(dpMid).call(dpMid);

		const forkLevels = deepParse(dpForked);
		const midLevels = deepParse(dpMid);
		expect(forkLevels.length).toEqual(midLevels.length);
		expect(forkLevels[0].name).toEqual('DeepParseLevel2Jest');
		expect(forkLevels[1].name).toEqual('DeepParseLevel1Jest');
		expect(forkLevels[0].self).not.toBe(dpMid);
		expect(forkLevels[1].self).toBe(midLevels[1].self);
	});

	it('keeps repeated type names as separate levels (strictChain: false)', () => {
		const Repeated = define('RepeatedNameJest', function () {}, { strictChain: false });
		Repeated.define('RepeatedNameJest', function () {});
		const first = new Repeated();
		const again = new first.RepeatedNameJest();

		const levels = deepParse(again);
		expect(levels.length).toEqual(2);
		expect(levels[0].name).toEqual('RepeatedNameJest');
		expect(levels[1].name).toEqual('RepeatedNameJest');
		expect(levels[0].self).not.toBe(levels[1].self);
	});

});

describe('utils/lineage (the lethe export)', () => {

	const canonical = (value: unknown): string => {
		if (Array.isArray(value)) {
			return '[' + value.map(canonical).join(',') + ']';
		}
		if (value !== null && typeof value === 'object') {
			const keys = Object.keys(value as Record<string, unknown>).sort();
			return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical((value as Record<string, unknown>)[k])).join(',') + '}';
		}
		return JSON.stringify(value);
	};

	// the lethe id-mapping: heads first, then per node the own fields
	// (a $ref target at first encounter), then the parent, depth first
	const remap = (graph: ReturnType<typeof lineage>, placeholders: string[]): string => {
		const idToPlaceholder = new Map<string, string>();
		let nextIndex = 0;
		const mapId = (id: string) => {
			if (!idToPlaceholder.has(id)) {
				idToPlaceholder.set(id, placeholders[nextIndex++]);
			}
			return idToPlaceholder.get(id)!;
		};
		const walk = (id: string) => {
			mapId(id);
			const node = graph.nodes[id];
			const collect = (value: unknown) => {
				if (Array.isArray(value)) {
					value.forEach(collect);
					return;
				}
				if (value !== null && typeof value === 'object') {
					const record = value as Record<string, unknown>;
					if (typeof record.$ref === 'string') {
						if (!idToPlaceholder.has(record.$ref)) {
							walk(record.$ref);
						}
						return;
					}
					if (record.$mnemonica !== undefined) return;
					Object.keys(record).forEach((key) => collect(record[key]));
				}
			};
			collect(node.own);
			if (node.parent !== null && !idToPlaceholder.has(node.parent)) {
				walk(node.parent);
			}
		};
		graph.heads.forEach(walk);
		const rename = (value: unknown): unknown => {
			if (typeof value === 'string' && idToPlaceholder.has(value)) {
				return idToPlaceholder.get(value);
			}
			if (Array.isArray(value)) return value.map(rename);
			if (value !== null && typeof value === 'object') {
				const out: Record<string, unknown> = {};
				Object.keys(value as Record<string, unknown>).forEach((k) => {
					const mappedKey = idToPlaceholder.has(k) ? idToPlaceholder.get(k)! : k;
					out[mappedKey] = rename((value as Record<string, unknown>)[k]);
				});
				return out;
			}
			return value;
		};
		return canonical(rename(JSON.parse(JSON.stringify(graph))));
	};

	const buildFixture = () => {
		const fixtureCollection = createTypesCollection({ name: 'fixture' });
		const FixtureUser = fixtureCollection.define('User', function (this: { Name: string }, name: string) {
			this.Name = name;
		});
		const FixtureAdmin = FixtureUser.define('Admin', function (this: { Role: string; Attached: unknown }, role: string) {
			this.Role = role;
			this.Attached = null;
		});
		FixtureAdmin.define('SuperAdmin', function (this: { Level: number }, level: number) {
			this.Level = level;
		});
		const fixtureRoot = new FixtureUser('ada');
		const adminOne = new fixtureRoot.Admin('root');
		const adminTwo = new fixtureRoot.Admin('operator');
		const superAdmin = new adminOne.SuperAdmin(7);
		adminOne.Attached = fixtureRoot;
		return { superAdmin, adminTwo };
	};

	it('reproduces the lethe fixture byte-for-byte', () => {
		const { superAdmin, adminTwo } = buildFixture();
		const graph = lineage([superAdmin as object, adminTwo as object]);
		const bytes = remap(graph, ['s', 'a1', 'u', 'a2']);
		expect(bytes).toEqual(canonical(letheFixture));
	});

	it('every export validates against the lethe schema', () => {
		const { superAdmin, adminTwo } = buildFixture();
		const ajv = new Ajv2020({ allErrors: true, strict: true });
		const validate = ajv.compile(letheSchema);
		const graph = lineage([superAdmin as object, adminTwo as object]);
		expect(validate(JSON.parse(JSON.stringify(graph)))).toBe(true);
	});

	it('dedups shared ancestors at any depth and $refs instance fields', () => {
		const { superAdmin, adminTwo } = buildFixture();
		const graph = lineage([superAdmin as object, adminTwo as object]);
		expect(Object.keys(graph.nodes).length).toEqual(4);
		expect(graph.version).toEqual('1');
		const nodes = Object.keys(graph.nodes).map((id) => graph.nodes[id]);
		const shared = nodes.find((node) => node.type.path === 'User')!;
		expect(shared.parent).toBeNull();
		const adminOneNode = nodes.find(
			(node) => node.type.path === 'User.Admin' && node.own.Attached !== null
		)!;
		const userId = Object.keys(graph.nodes).find((id) => graph.nodes[id].type.path === 'User')!;
		expect((adminOneNode.own.Attached as { $ref: string }).$ref).toEqual(userId);
	});

	it('unsupported values become tagged placeholders, never errors', () => {
		const WeirdRoot = define('LineageWeirdRootJest', function (this: Record<string, unknown>) {
			this.fn = function () {};
			this.nan = NaN;
			this.inf = Infinity;
			this.ninf = -Infinity;
			this.sym = Symbol('s');
			this.nested = { deep: [function () {}] };
		});
		const cyclic = { name: 'cycle-holder' } as Record<string, unknown>;
		cyclic.self = cyclic;
		const weird = new WeirdRoot() as Record<string, unknown>;
		weird.cycleField = cyclic;
		const graph = lineage([weird]);
		const node = graph.nodes[graph.heads[0]];
		expect(node.own.fn).toEqual({ '$mnemonica': 'unsupported', kind: 'func' });
		expect(node.own.nan).toEqual({ '$mnemonica': 'unsupported', kind: 'nan' });
		expect(node.own.inf).toEqual({ '$mnemonica': 'unsupported', kind: '+inf' });
		expect(node.own.ninf).toEqual({ '$mnemonica': 'unsupported', kind: '-inf' });
		expect(node.own.sym).toEqual({ '$mnemonica': 'unsupported', kind: 'invalid' });
		expect(node.own.nested).toEqual({ deep: [{ '$mnemonica': 'unsupported', kind: 'func' }] });
		expect((node.own.cycleField as Record<string, unknown>).name).toEqual('cycle-holder');
		expect((node.own.cycleField as Record<string, unknown>).self).toEqual({ '$mnemonica': 'unsupported', kind: 'cycle' });
	});

	it('args and props are opt-in', () => {
		const ArgsRoot = define('LineageArgsRootJest', function (this: { a: number; b: number }, a: number, b: number) {
			this.a = a;
			this.b = b;
		});
		const withOpts = lineage([new ArgsRoot(1, 2) as object], { args: true, props: ['__timestamp__'] });
		const withNode = withOpts.nodes[withOpts.heads[0]];
		expect(withNode.args).toEqual([1, 2]);
		expect(typeof (withNode.props as Record<string, unknown>).__timestamp__).toEqual('number');
		const plain = lineage([new ArgsRoot(1, 2) as object]);
		const plainNode = plain.nodes[plain.heads[0]];
		expect(plainNode.args).toBeUndefined();
		expect(plainNode.props).toBeUndefined();
	});

	it('unnamed collections export as defaultTypes; the root parent is null', () => {
		const graph = lineage([new (define('LineageDefaultRootJest', function (this: { x: number }) {
			this.x = 1;
		}))() as object]);
		const node = graph.nodes[graph.heads[0]];
		expect(node.type.collection).toEqual('defaultTypes');
		expect(node.type.path).toEqual('LineageDefaultRootJest');
		expect(node.parent).toBeNull();
	});

});
