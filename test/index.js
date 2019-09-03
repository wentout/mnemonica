'use strict';

const { assert, expect } = require('chai');

const {
	define,
	types,
	collectConstructors,
	MNEMONICA,
	SymbolSubtypeCollection,
	// SymbolConstructorName,
} = require('..');

const USER_DATA = {
	email : 'went.out@gmail.com',
	password : 321
};

const UserTypeProto = {
	email : '',
	password : '',
	description : 'UserType'
};

const UserTypeConstructorProto = {
	email : '',
	password : '',
	description : 'UserTypeConstructor'
};

const UserType = define('UserType', function (userData) {
	const {
		email,
		password
	} = userData;
	this.email = email;
	this.password = password;
}, UserTypeProto, true);



const pl1ProtoOnlyGetterPart = {
	UserTypePL1 : 'UserTypePL_1_Excluded'
};
const pl1ProtoIncludedPart = {
	UserTypePL1Included : 'UserTypePL_1_Included'
};
const pl1Proto = Object.assign({},
				pl1ProtoOnlyGetterPart,
					pl1ProtoIncludedPart);

UserType.define(() => {
	const UserTypePL1 = function () {
		this.user_pl_1_sign = 'pl_1';
	};
	UserTypePL1.prototype = pl1Proto;
	return UserTypePL1;
}, true);

const pl2Proto = {
	UserTypePL2 : 'UserTypePL_2_AlwaysIncluded'
};
UserType.define(() => {
	const UserTypePL2 = function () {
		this.user_pl_2_sign = 'pl_2';
	};
	UserTypePL2.prototype = pl2Proto;
	return UserTypePL2;
});



/*
UserTypeConstructor and nested types
*/

define('UserTypeConstructor', function (userData) {
	const {
		email,
		password
	} = userData;
	
	this.email = email;
	this.password = password;
}, UserTypeConstructorProto);

const WithoutPasswordProto = {
	WithoutPasswordSign : 'WithoutPasswordSign'
};

const UserWithoutPassword = types.UserTypeConstructor.define(() => {
	const WithoutPassword = function () {
		this.password = undefined;
	};
	WithoutPassword.prototype = WithoutPasswordProto;
	return WithoutPassword;
});

const WithAdditionalSignProto = {
	WithAdditionalSignSign : 'WithAdditionalSignSign'
};
const WithAdditionalSign = UserWithoutPassword.define(() => {
	const WithAdditionalSign = function (sign) {
		this.sign = sign;
	};
	WithAdditionalSign.prototype = WithAdditionalSignProto;
	return WithAdditionalSign;
});

const MoreOverProto = {
	MoreOverSign : 'MoreOverSign'
};
const MoreOver = WithAdditionalSign.define(() => {
	const MoreOver = function (str) {
		this.str = str || 'moreover str';
	};
	MoreOver.prototype = MoreOverProto;
	return MoreOver;
});

const OverMoreProto = {
	OverMoreSign : 'OverMoreSign'
};
const OverMore = MoreOver.define(() => {
	const OverMore = function (str) {
		this.str = str || 're-defined OverMore str';
	};
	OverMore.prototype = OverMoreProto;
	return OverMore;
});

const EvenMoreProto = {
	EvenMoreSign : 'EvenMoreSign'
};
OverMore.define(() => {
	const EvenMore = function (str) {
		this.str = str || 're-defined EvenMore str';
	};
	EvenMore.prototype = EvenMoreProto;
	return EvenMore;
});




// *****************************************************
// *****************************************************
// *****************************************************

const user = new UserType(USER_DATA);

const userPL1 = new user.UserTypePL1();

const userPL2 = new user.UserTypePL2();
const userPL_1_2 = new userPL1.UserTypePL2();
const userPL_NoNew = userPL1.UserTypePL2();

const userTC = new types.UserTypeConstructor(USER_DATA);

const userWithoutPassword = new userTC.WithoutPassword();
const userWithoutPassword_2 = new userTC.WithoutPassword();

const sign2add = 'userWithoutPassword_2.WithAdditionalSign';
const userWPWithAdditionalSign = new userWithoutPassword_2
	.WithAdditionalSign(sign2add);

const moreOverStr = 'moreOver str from test scope';
const moreOver = userWPWithAdditionalSign.MoreOver(moreOverStr);

const overMore = moreOver.OverMore();
const evenMore = overMore.EvenMore();


const checkTypeDefinition = (types, TypeName, proto, useOldStyle) => {
	const parentType = types[SymbolSubtypeCollection];
	const isSubType = parentType === MNEMONICA ? false : true;
	describe(`initial type declaration ${TypeName}`, () => {
		const def = types[TypeName];
		it('should exist', () => {
			assert.isDefined(def);
		});
		it('and have proper name', () => {
			assert.ok(def.TypeName === TypeName);
		});
		it('.subtypes must be an object', () => {
			assert.isObject(def.subtypes);
		});
		it('.proto must be equal with definition', () => {
			assert.equal(def.proto, proto);
		});
		it(`and declared as proper SubType : ${def.isSubType} `, () => {
			assert.equal(def.isSubType, isSubType);
		});
		it(`will use old style contructor : ${useOldStyle}`, () => {
			assert.equal(def.useOldStyle, useOldStyle);
		});
		it('contructor exists', () => {
			assert.isFunction(def.ConstructHandler);
		});
	});
};

describe('Type Definitions Tests', () => {
	[
		[types, 'UserType', UserTypeProto, true],
		[UserType.subtypes, 'UserTypePL1', pl1Proto, true],
		[UserType.subtypes, 'UserTypePL2', pl2Proto],
		[types, 'UserTypeConstructor', UserTypeConstructorProto],
		[types.UserTypeConstructor.subtypes, 'WithoutPassword', WithoutPasswordProto],
		[UserWithoutPassword.subtypes, 'WithAdditionalSign', WithAdditionalSignProto],
		[WithAdditionalSign.subtypes, 'MoreOver', MoreOverProto],
		[MoreOver.subtypes, 'OverMore', OverMoreProto],
		[OverMore.subtypes, 'EvenMore', EvenMoreProto],
	].forEach(entry => {
		const [types, def, proto, useOldStyle] = entry;
		checkTypeDefinition(types, def, proto, useOldStyle || false);
	});
});


describe('Instance Constructors Tests', () => {

	it('type constructor itself is correct', () => {
		assert.instanceOf(user, types.UserType);
		assert.equal(types.UserType, UserType);
	});
	it('actually do construction', () => {
		assert.instanceOf(user, UserType);
		assert.instanceOf(user, types.UserType);
	});
	it('.constructor.name is correct', () => {
		assert.equal(user.constructor.name, 'UserType');
	});
	it('.prototype is correct', () => {
		assert.deepEqual(user.constructor.prototype, UserTypeProto);
	});
	
	describe('nested type with old style check', () => {
		it('actually do construction', () => {
			assert.instanceOf(userPL1, types.UserType.subtypes.UserTypePL1);
			assert.instanceOf(userPL1, user.UserTypePL1);
		});
		it('.constructor.name is correct', () => {
			assert.equal(userPL1.constructor.name, 'UserTypePL1');
		});
		it('.prototype is correct', () => {
			// expect(userPL1.constructor.prototype).to.be.an('object')
			// 	.that.not.includes(pl1ProtoOnlyGetterPart);
			// expect(userPL1.constructor.prototype).to.be.an('object')
			// 	.that.includes(pl1ProtoIncludedPart);
			expect(userPL1.constructor.prototype).to.be.an('object')
				.that.includes(pl1Proto);
			assert.include(pl1Proto, userPL1.constructor.prototype);
			Object.entries(pl1Proto).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userPL1[key], value);
			});
		});
		it('definition is correct', () => {
			const checker = Object.assign({
				user_pl_1_sign : 'pl_1',
			});
			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.isTrue(userPL1.hasOwnProperty(key));
				assert.equal(userPL1[key], value);
			});
		});
	});
	
	describe('nested type with new style check', () => {
		it('actually do construction', () => {
			assert.instanceOf(userPL2, types.UserType.subtypes.UserTypePL2);
			assert.instanceOf(userPL2, user.UserTypePL2);
		});
		it('.constructor.name is correct', () => {
			assert.equal(userPL2.constructor.name, 'UserTypePL2');
		});
		it('can construct without "new" keyword', () => {
			assert.instanceOf(userPL_NoNew, types.UserType.subtypes.UserTypePL2);
		});
		it('and insanceof stays ok', () => {
			assert.instanceOf(userPL_NoNew, user.UserTypePL2);
		});
		it('and even for sibling type', () => {
			assert.instanceOf(userPL_1_2, userPL1.UserTypePL2);
		});
		it('and even for sibling type constructed without "new"', () => {
			assert.instanceOf(userPL_NoNew, userPL1.UserTypePL2);
		});
		it('.prototype is correct', () => {
			expect(userPL2.constructor.prototype).to.be.an('object')
				.that.includes(pl2Proto);
		});
		it('definition is correct', () => {
			const checker = Object.assign({
				user_pl_2_sign : 'pl_2',
			}, USER_DATA);
			Object.keys(USER_DATA).forEach(key => {
				assert.isFalse(userPL2[key].hasOwnProperty(key));
			});
			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userPL2[key], value);
			});
		});
	});
	
	describe('more nested types', () => {
		it('.prototype is correct', () => {
			expect(userTC.constructor.prototype).to.be.an('object')
				.that.includes(UserTypeConstructorProto);
		});
		it('definition is correct', () => {
			const checker = Object.assign(UserTypeConstructorProto, USER_DATA);
			Object.keys(USER_DATA).forEach(key => {
				assert.isFalse(userTC[key].hasOwnProperty(key));
			});
			Object.entries(checker).forEach(entry => {
				const [key, value] = entry;
				assert.equal(userTC[key], value);
			});
		});
		it('clones are correct', () => {
			assert.deepOwnInclude(userWithoutPassword, userWithoutPassword_2);
		});
		it('clones are nested include', () => {
			assert.deepNestedInclude(userWithoutPassword, {
				password: undefined
			});
			assert.notDeepOwnInclude(userWithoutPassword, userTC);
			assert.deepOwnInclude(userWPWithAdditionalSign, {
				sign: sign2add
			});
			assert.deepOwnInclude(moreOver, {
				str: moreOverStr
			});
		});
		const evenMoreConstructors = collectConstructors(evenMore);

		describe('constructors sequence is ok', () => {
			var base = types;
			Object.keys(evenMoreConstructors)
				.reverse()
				.map((name, idx) => {
					var iof = false;
					if (name === 'Object') {
						iof = evenMore instanceof Object;
					} else {

						if (base && base[name]) {
							iof = evenMore instanceof base[name];
							base = base[name].subtypes;
						} else {
							if (!base) {
								return { idx, name, iof };
							}

						}
					}
					return { idx, name, iof };
				})
					.reverse()
					.forEach(props => {
						if (!props) {
							return;
						}
						const {idx, name, iof} = props;
						const str = `${idx} evenMore instanceof ${name}`;
						it(`must be true : ${str}`, () => {
							assert.isTrue(iof, str);
						});
					});
		});
	});


});