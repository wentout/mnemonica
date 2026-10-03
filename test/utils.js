'use strict';

const { assert } = require('chai');

const mnemonica = require('..');
const { withInstanceMethods } = require('./instance-methods-helper');

const {
	define,
	lazy,
	errors,
	getProps,
	createTypesCollection,
} = mnemonica;

// Import raw utilities directly for testing
const { exception } = require('../build/utils/exception');
const { sibling } = require('../build/utils/sibling');
const { fork } = require('../build/utils/fork');
const { clone } = require('../build/utils/clone');
const { extract } = require('../build/utils/extract');
const { toJSON } = require('../build/utils/toJSON');
const { deepParse } = require('../build/utils/deepParse');
const { lineage } = require('../build/utils/lineage');
const Ajv2020 = require('ajv/dist/2020');
const letheSchema = require('@mnemonica/lethe/lineage.schema.json');
const letheFixture = require('@mnemonica/lethe/testdata/lineage/fixture.json');

const tests = () => {

	describe('utils/exception', () => {

		const SomeType = define('ExceptionTestTypeMocha', withInstanceMethods(function () { }));
		const instance = new SomeType();

		describe('called without new', () => {
			it('should throw WRONG_INSTANCE_INVOCATION', () => {
				try {
					exception(instance, new Error('test'));
					assert.fail('should have thrown');
				} catch (error) {
					assert.instanceOf(error, errors.WRONG_INSTANCE_INVOCATION);
				}
			});
		});

		describe('called with new', () => {

			it('should throw when error is not instanceof Error', () => {
				try {
					new exception(instance, 'not an error');
					assert.fail('should have thrown');
				} catch (error) {
					assert.instanceOf(error, errors.WRONG_ARGUMENTS_USED);
				}
			});

			it('should create proper exception instance', () => {
				const originalError = new Error('original');
				const exceptionInstance = new exception(
					instance,
					originalError,
					1,
					2,
					3
				);

				assert.instanceOf(exceptionInstance, Error);
				const exceptionProps = getProps(exceptionInstance);
				assert.equal(exceptionProps.instance, instance);
				assert.equal(exceptionProps.originalError, originalError);
				assert.deepEqual(exceptionProps.args, [ 1, 2, 3 ]);
			});

			it('should expose no bound methods; use utils on props instance instead', () => {
				const originalError = new Error('original');
				const exceptionInstance = new exception(
					instance,
					originalError
				);

				assert.isUndefined(exceptionInstance.extract);
				assert.isUndefined(exceptionInstance.parse);
				assert.isUndefined(exceptionInstance.instance);
				const exceptionProps = getProps(exceptionInstance);
				assert.deepEqual(
					extract(exceptionProps.instance),
					extract(instance)
				);
			});

		});

	});

	describe('utils/sibling', () => {

		const CollectionA = define('SiblingTestCollectionAMocha', withInstanceMethods(function () { }));
		const CollectionB = define('SiblingTestCollectionBMocha', withInstanceMethods(function () { }));
		const instanceA = new CollectionA();
		const instanceB = new CollectionB();

		describe('direct call (apply trap)', () => {
			it('should find sibling by name', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy('SiblingTestCollectionBMocha');
				assert.equal(result, CollectionB);
			});

			it('should return undefined for missing sibling', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy('NonExistentType');
				assert.equal(result, undefined);
			});
		});

		describe('property access (get trap)', () => {
			it('should find sibling by property access', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy.SiblingTestCollectionBMocha;
				assert.equal(result, CollectionB);
			});

			it('should return undefined for missing sibling property', () => {
				const siblingProxy = sibling(instanceA);
				const result = siblingProxy.NonExistentType;
				assert.equal(result, undefined);
			});
		});

		describe('with different instances', () => {
			it('should return sibling from instanceB collection', () => {
				const siblingProxy = sibling(instanceB);
				const result = siblingProxy('SiblingTestCollectionAMocha');
				assert.equal(result, CollectionA);
			});
		});

	});

	describe('utils/fork', () => {

		const originalData = { value : 'original' };
		const ForkTestType = define('ForkTestTypeMocha', function (data) {
			this.value = data.value;
		});
		const instance = new ForkTestType(originalData);

		describe('fork with original args', () => {
			it('should create fork with original args when called with no args', () => {
				const forkFn = fork(instance);
				const forked = forkFn.call(instance);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'original');
			});
		});

		describe('fork with new args', () => {
			it('should create fork with new args', () => {
				const newData = { value : 'forked' };
				const forkFn = fork(instance);
				const forked = forkFn.call(instance, newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked');
			});
		});

		describe('fork preserves type', () => {
			it('should preserve instanceof relationship', () => {
				const forkFn = fork(instance);
				const forked = forkFn.call(instance);

				assert.instanceOf(forked, ForkTestType);
				assert.instanceOf(instance, ForkTestType);
			});
		});

		describe('fork with different this', () => {
			it('should use InstanceCreator when this is not __self__', () => {
				const OtherType = define('ForkOtherTypeMocha', function () { });
				const otherInstance = new OtherType();
				const newData = { value : 'forked from other' };
				const forkFn = fork(instance);
				const forked = forkFn.call(otherInstance, newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked from other');
			});
		});

		describe('fork on subtype', () => {
			it('should fork subtype using existentInstance as Constructor', () => {
				const ParentType = define('ForkParentTypeMocha', function (data) {
					this.parentVal = data.parentVal;
				});
				const SubType = ParentType.define('ForkSubTypeMocha', function (data) {
					this.subVal = data.subVal;
				});
				const parentInstance = new ParentType({ parentVal : 'parent' });
				const subInstance = new parentInstance.ForkSubTypeMocha({ subVal : 'sub' });

				const forkFn = fork(subInstance);
				const forked = forkFn.call(subInstance);

				assert.instanceOf(forked, SubType);
				assert.equal(forked.subVal, 'sub');
			});
		});

		describe('fork with primitive wrapper this', () => {
			it('should work when called with new Boolean(this)', () => {
				const newData = { value : 'forked with boolean wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new Boolean(5), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with boolean wrapper');
			});

			it('should work when called with new String(this)', () => {
				const newData = { value : 'forked with string wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new String('test'), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with string wrapper');
			});

			it('should work when called with new Number(this)', () => {
				const newData = { value : 'forked with number wrapper' };
				const forkFn = fork(instance);
				const forked = forkFn.call(new Number(42), newData);

				assert.instanceOf(forked, ForkTestType);
				assert.equal(forked.value, 'forked with number wrapper');
			});
		});

	});

	describe('utils/clone', () => {

		const CloneTestType = define('CloneTestTypeMocha', withInstanceMethods(function (data) {
			this.value = data.value;
		}));
		const ParentType = define('CloneParentTypeMocha', withInstanceMethods(function (data) {
			this.parentVal = data.parentVal;
		}));
		const SubType = ParentType.define('CloneSubTypeMocha', function (data) {
			this.subVal = data.subVal;
		});

		describe('clone root type instance', () => {
			it('should create a new instance with original args', () => {
				const originalData = { value : 'original' };
				const instance = new CloneTestType(originalData);
				const cloned = clone(instance);

				assert.instanceOf(cloned, CloneTestType);
				assert.equal(cloned.value, 'original');
			});

			it('should not return the same reference', () => {
				const originalData = { value : 'original' };
				const instance = new CloneTestType(originalData);
				const cloned = clone(instance);

				assert.notEqual(cloned, instance);
			});

			it('should preserve instanceof relationship', () => {
				const originalData = { value : 'original' };
				const instance = new CloneTestType(originalData);
				const cloned = clone(instance);

				assert.instanceOf(cloned, CloneTestType);
				assert.instanceOf(instance, CloneTestType);
			});

			it('should deep equal the original', () => {
				const originalData = { value : 'original' };
				const instance = new CloneTestType(originalData);
				const cloned = clone(instance);

				assert.deepEqual(cloned, instance);
				assert.deepEqual(cloned.extract(), instance.extract());
			});
		});

		describe('clone nested subtype instance', () => {
			it('should clone subtype using existentInstance as Constructor', () => {
				const parentInstance = new ParentType({ parentVal : 'parent' });
				const subInstance = new parentInstance.CloneSubTypeMocha({ subVal : 'sub' });

				const cloned = clone(subInstance);

				assert.instanceOf(cloned, SubType);
				assert.equal(cloned.subVal, 'sub');
				assert.notEqual(cloned, subInstance);
				assert.deepEqual(cloned.extract(), subInstance.extract());
			});
		});

	});

	describe('utils/toJSON', () => {

		const ToJsonType = define('ToJsonTestTypeMocha', function () {
			this.str = 'value';
			this.num = 123;
		});
		const toJsonInstance = new ToJsonType();

		it('should round-trip normal fields', () => {
			const parsedRoundTrip = JSON.parse( toJSON( toJsonInstance ) );
			assert.equal( parsedRoundTrip.str, 'value' );
			assert.equal( parsedRoundTrip.num, 123 );
		});

		it('should produce {} for no fields at all', () => {
			const EmptyToJsonType = define('EmptyToJsonTestTypeMocha', function () {});
			const emptyToJsonInstance = new EmptyToJsonType();
			assert.equal( toJSON( emptyToJsonInstance ), '{}' );
		});

		it('should omit null and undefined fields — only-null becomes {}', () => {
			const NullishToJsonType = define('NullishToJsonTestTypeMocha', function () {
				this.nil = null;
				this.undef = undefined;
			});
			const nullishToJsonInstance = new NullishToJsonType();
			assert.equal( toJSON( nullishToJsonInstance ), '{}' );
		});

		it('should escape keys — a quote in a key stays valid JSON', () => {
			const QuotedToJsonType = define('QuotedToJsonTestTypeMocha', function () {
				this[ 'quoted"key' ] = 'quoted value';
			});
			const quotedToJsonInstance = new QuotedToJsonType();
			const quotedResult = toJSON( quotedToJsonInstance );
			const quotedParsed = JSON.parse( quotedResult );
			assert.equal( quotedParsed[ 'quoted"key' ], 'quoted value' );
		});

		it('should replace an unstringifiable (circular) value with the description object', () => {
			const CircularToJsonType = define('CircularToJsonTestTypeMocha', function () {
				this.self = this;
			});
			const circularToJsonInstance = new CircularToJsonType();
			const circularParsed = JSON.parse( toJSON( circularToJsonInstance ) );
			assert.equal(
				circularParsed.self.description,
				'This value type is not supported by JSON.stringify'
			);
			assert.isString( circularParsed.self.message );
		});

		it('should replace a function value (stringify returns undefined) with the description object', () => {
			const FnToJsonType = define('FnToJsonTestTypeMocha', function () {
				this.fn = function () {};
			});
			const fnToJsonInstance = new FnToJsonType();
			const fnParsed = JSON.parse( toJSON( fnToJsonInstance ) );
			assert.equal(
				fnParsed.fn.description,
				'This value type is not supported by JSON.stringify'
			);
		});

	});


	describe('utils/deepParse', () => {

		const DPLevel1 = define('DeepParseLevel1Mocha', function () {});
		const DPLevel2 = DPLevel1.define('DeepParseLevel2Mocha', function () {});
		DPLevel2.define('DeepParseLevel3Mocha', function () {});

		it('should walk from the instance to the root in order', () => {
			const dpRoot = new DPLevel1();
			const dpMid = new dpRoot.DeepParseLevel2Mocha();
			const dpLeaf = new dpMid.DeepParseLevel3Mocha();

			const levels = deepParse( dpLeaf );
			assert.equal( levels.length, 3 );
			assert.equal( levels[ 0 ].name, 'DeepParseLevel3Mocha' );
			assert.equal( levels[ 1 ].name, 'DeepParseLevel2Mocha' );
			assert.equal( levels[ 2 ].name, 'DeepParseLevel1Mocha' );
			// index 0 IS the instance itself
			assert.equal( levels[ 0 ].self, dpLeaf );
			// the root's parent is null — the walk stops there
			assert.strictEqual( levels[ 2 ].parent, null );
		});

		it('should hop real parent instances, skipping the prototype layers', () => {
			const dpRoot = new DPLevel1();
			const dpLeaf = new ( new dpRoot.DeepParseLevel2Mocha() ).DeepParseLevel3Mocha();

			const levels = deepParse( dpLeaf );
			// each next level's self IS the previous level's parent —
			// the per-type prototype hops never appear
			assert.equal( levels[ 1 ].self, levels[ 0 ].parent );
			assert.equal( levels[ 2 ].self, levels[ 1 ].parent );
		});

		it('should work for a single-level (root) instance', () => {
			const dpRoot = new DPLevel1();
			const levels = deepParse( dpRoot );
			assert.equal( levels.length, 1 );
			assert.equal( levels[ 0 ].name, 'DeepParseLevel1Mocha' );
		});

		it('should walk chains in a non-default collection', () => {
			const collection = createTypesCollection();
			const CRoot = collection.define( 'DeepParseCCRootMocha', function () {} );
			CRoot.define( 'DeepParseCCSubMocha', function () {} );
			const ccRoot = new CRoot();
			const ccLeaf = new ccRoot.DeepParseCCSubMocha();

			const levels = deepParse( ccLeaf );
			assert.equal( levels.length, 2 );
			assert.equal( levels[ 0 ].name, 'DeepParseCCSubMocha' );
			assert.equal( levels[ 1 ].name, 'DeepParseCCRootMocha' );
			assert.equal( levels[ 1 ].self, ccRoot );
		});

		it('should give a fork a NEW parent, not the forked-from instance', () => {
			const dpRoot = new DPLevel1();
			const dpMid = new dpRoot.DeepParseLevel2Mocha();
			const dpForked = fork( dpMid ).call( dpMid );

			const forkLevels = deepParse( dpForked );
			const midLevels = deepParse( dpMid );
			// same shape — the fork is a sibling subtree: a NEW leaf under
			// the SAME parent instance (the plan's question C: siblings
			// share their parent instances)
			assert.equal( forkLevels.length, midLevels.length );
			assert.equal( forkLevels[ 0 ].name, 'DeepParseLevel2Mocha' );
			assert.equal( forkLevels[ 1 ].name, 'DeepParseLevel1Mocha' );
			assert.notEqual( forkLevels[ 0 ].self, dpMid );
			assert.equal( forkLevels[ 1 ].self, midLevels[ 1 ].self );
		});

		it('should keep repeated type names as separate levels (strictChain: false)', () => {
			const Repeated = define( 'RepeatedNameMocha', function () {}, { strictChain : false } );
			// the same name one level down — allowed without strictChain
			Repeated.define( 'RepeatedNameMocha', function () {} );
			const first = new Repeated();
			const again = new first.RepeatedNameMocha();

			const levels = deepParse( again );
			assert.equal( levels.length, 2 );
			assert.equal( levels[ 0 ].name, 'RepeatedNameMocha' );
			assert.equal( levels[ 1 ].name, 'RepeatedNameMocha' );
			assert.notEqual( levels[ 0 ].self, levels[ 1 ].self );
		});

	});

	describe('utils/lineage (the lethe export)', () => {

		// canonical form: sorted keys, no whitespace — the fixture bytes
		const canonical = (value) => {
			if (Array.isArray(value)) {
				const arrayString = `[${  value.map(canonical).join(',')  }]`;
				return arrayString;
			}
			if (value !== null && typeof value === 'object') {
				const keys = Object.keys(value).sort();
				const objectString = `{${  keys.map((k) => `${JSON.stringify(k)  }:${  canonical(value[ k ])}`).join(',')  }}`;
				return objectString;
			}
			const primitiveString = JSON.stringify(value);
			return primitiveString;
		};

		// the lethe id-mapping: heads first, then per node the own fields
		// (a $ref target at first encounter), then the parent, depth first
		const remap = (graph, placeholders) => {
			const idToPlaceholder = new Map();
			let nextIndex = 0;
			const mapId = (id) => {
				if (!idToPlaceholder.has(id)) {
					idToPlaceholder.set(id, placeholders[ nextIndex++ ]);
				}
				const mappedId = idToPlaceholder.get(id);
				return mappedId;
			};
			const walk = (id) => {
				mapId(id);
				const node = graph.nodes[ id ];
				const collect = (value) => {
					if (Array.isArray(value)) {
						value.forEach(collect);
						return;
					}
					if (value !== null && typeof value === 'object') {
						if (typeof value.$ref === 'string') {
							if (!idToPlaceholder.has(value.$ref)) {
								walk(value.$ref);
							}
							return;
						}
						if (value.$mnemonica !== undefined) return;
						Object.keys(value).forEach((key) => collect(value[ key ]));
					}
				};
				collect(node.own);
				if (node.parent !== null && !idToPlaceholder.has(node.parent)) {
					walk(node.parent);
				}
			};
			graph.heads.forEach(walk);
			const rename = (value) => {
				if (typeof value === 'string' && idToPlaceholder.has(value)) {
					const renamedString = idToPlaceholder.get(value);
					return renamedString;
				}
				if (Array.isArray(value)) {
					const renamedArray = value.map(rename);
					return renamedArray;
				}
				if (value !== null && typeof value === 'object') {
					const out = {};
					Object.keys(value).forEach((k) => {
						const mappedKey = idToPlaceholder.has(k) ? idToPlaceholder.get(k) : k;
						out[ mappedKey ] = rename(value[ k ]);
					});
					return out;
				}
				return value;
			};
			const remappedString = canonical(rename(JSON.parse(JSON.stringify(graph))));
			return remappedString;
		};

		// the recipe from @mnemonica/lethe testdata README
		const buildFixture = () => {
			const fixtureCollection = createTypesCollection({ name : 'fixture' });
			const FixtureUser = fixtureCollection.define('User', function (name) {
				this.Name = name;
			});
			const FixtureAdmin = FixtureUser.define('Admin', function (role) {
				this.Role = role;
				this.Attached = null;
			});
			FixtureAdmin.define('SuperAdmin', function (level) {
				this.Level = level;
			});
			const fixtureRoot = new FixtureUser('ada');
			const adminOne = new fixtureRoot.Admin('root');
			const adminTwo = new fixtureRoot.Admin('operator');
			const superAdmin = new adminOne.SuperAdmin(7);
			adminOne.Attached = fixtureRoot;
			const fixturePair = { superAdmin, adminTwo };
			return fixturePair;
		};

		it('reproduces the lethe fixture byte-for-byte', () => {
			const { superAdmin, adminTwo } = buildFixture();
			const graph = lineage([ superAdmin, adminTwo ]);
			const bytes = remap(graph, [ 's', 'a1', 'u', 'a2' ]);
			const expected = canonical(letheFixture);
			assert.equal(bytes, expected);
		});

		it('every export validates against the lethe schema', () => {
			const { superAdmin, adminTwo } = buildFixture();
			const ajv = new Ajv2020({ allErrors : true, strict : true });
			const validate = ajv.compile(letheSchema);
			const graph = lineage([ superAdmin, adminTwo ]);
			assert.isTrue(validate(JSON.parse(JSON.stringify(graph))),
				validate.errors ? JSON.stringify(validate.errors) : 'valid');
		});

		it('dedups shared ancestors at any depth and $refs instance fields', () => {
			const { superAdmin, adminTwo } = buildFixture();
			const graph = lineage([ superAdmin, adminTwo ]);
			assert.equal(Object.keys(graph.nodes).length, 4);
			assert.equal(graph.version, '1');
			const byPath = {};
			Object.keys(graph.nodes).forEach((id) => {
				byPath[ graph.nodes[ id ].type.path ] = graph.nodes[ id ];
			});
			const shared = byPath[ 'User' ];
			assert.strictEqual(shared.parent, null);
			// two Admin nodes exist (a1, a2) — pick the one whose Attached is set
			const adminOneNode = Object.keys(graph.nodes).map((id) => graph.nodes[ id ])
				.find(
					(node) => node.type.path === 'User.Admin' && node.own.Attached !== null
				);
			assert.equal(adminOneNode.own.Attached.$ref, Object.keys(graph.nodes).find(
				(id) => graph.nodes[ id ].type.path === 'User'
			));
		});

		it('unsupported values become tagged placeholders, never errors', () => {
			const WeirdRoot = define('LineageWeirdRoot', function () {
				this.fn = function () {};
				this.nan = NaN;
				this.inf = Infinity;
				this.ninf = -Infinity;
				this.sym = Symbol('s');
				this.nested = { deep : [ function () {} ] };
			});
			const cyclic = { name : 'cycle-holder' };
			cyclic.self = cyclic;
			const weird = new WeirdRoot();
			weird.cycleField = cyclic;
			const graph = lineage([ weird ]);
			const node = graph.nodes[ graph.heads[ 0 ] ];
			assert.deepEqual(node.own.fn, { '$mnemonica' : 'unsupported', kind : 'func' });
			assert.deepEqual(node.own.nan, { '$mnemonica' : 'unsupported', kind : 'nan' });
			assert.deepEqual(node.own.inf, { '$mnemonica' : 'unsupported', kind : '+inf' });
			assert.deepEqual(node.own.ninf, { '$mnemonica' : 'unsupported', kind : '-inf' });
			assert.deepEqual(node.own.sym, { '$mnemonica' : 'unsupported', kind : 'invalid' });
			assert.deepEqual(node.own.nested, { deep : [ { '$mnemonica' : 'unsupported', kind : 'func' } ] });
			assert.deepEqual(node.own.cycleField.name, 'cycle-holder');
			assert.deepEqual(node.own.cycleField.self, { '$mnemonica' : 'unsupported', kind : 'cycle' });
		});

		it('args and props are opt-in', () => {
			const ArgsRoot = define('LineageArgsRoot', function (a, b) {
				this.a = a;
				this.b = b;
			});
			const withOpts = lineage([ new ArgsRoot(1, 2) ], { args : true, props : [ '__timestamp__' ] });
			const withNode = withOpts.nodes[ withOpts.heads[ 0 ] ];
			assert.deepEqual(withNode.args, [ 1, 2 ]);
			assert.equal(typeof withNode.props.__timestamp__, 'number');
			const plain = lineage([ new ArgsRoot(1, 2) ]);
			const plainNode = plain.nodes[ plain.heads[ 0 ] ];
			assert.isUndefined(plainNode.args);
			assert.isUndefined(plainNode.props);
		});

		it('collection names: default is defaultTypes, unnamed customs are unique, the root parent is null', () => {
			const defaultGraph = lineage([ new (define('LineageDefaultRoot', function () {
				this.x = 1;
			}))() ]);
			const defaultNode = defaultGraph.nodes[ defaultGraph.heads[ 0 ] ];
			assert.equal(defaultNode.type.collection, 'defaultTypes');
			assert.equal(defaultNode.type.path, 'LineageDefaultRoot');
			assert.strictEqual(defaultNode.parent, null);

			const firstUnnamed = createTypesCollection();
			const secondUnnamed = createTypesCollection();
			const FirstT = firstUnnamed.define('LineageUnnamedOne', function () {
				this.x = 1;
			});
			const SecondT = secondUnnamed.define('LineageUnnamedTwo', function () {
				this.x = 2;
			});
			const firstGraph = lineage([ new FirstT() ]);
			const secondGraph = lineage([ new SecondT() ]);
			const firstName = firstGraph.nodes[ firstGraph.heads[ 0 ] ].type.collection;
			const secondName = secondGraph.nodes[ secondGraph.heads[ 0 ] ].type.collection;
			assert.match(firstName, /^collection_\d+$/);
			assert.match(secondName, /^collection_\d+$/);
			assert.notEqual(firstName, secondName);

			const named = createTypesCollection({ name : 'fixture' });
			const NamedT = named.define('LineageNamedRoot', function () {
				this.x = 1;
			});
			const namedGraph = lineage([ new NamedT() ]);
			assert.equal(namedGraph.nodes[ namedGraph.heads[ 0 ] ].type.collection, 'fixture');
		});

		it('define() rejects a type-level name with a readable error', () => {
			assert.throws(
				() => define('LineageNameReject', function () {}, { name : 'nope' }),
				/"name" is a collection option/
			);
			const RejectRoot = define('LineageNameRejectRoot', function () {});
			assert.throws(
				() => RejectRoot.define('LineageNameRejectSub', function () {}, { name : 'nope' }),
				/"name" is a collection option/
			);
			assert.throws(
				() => lazy('LineageNameRejectLazy', () => function () {}, { name : 'nope' }),
				/"name" is a collection option/
			);
			// and the collection's name is not inherited into the type config
			const unnamedCheck = createTypesCollection();
			const UnnamedT = unnamedCheck.define('LineageConfigClean', function () {});
			assert.notProperty(UnnamedT.config, 'name');
		});

	});

};

module.exports = tests;
