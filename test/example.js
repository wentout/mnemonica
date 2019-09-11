'use strict';

const {
	define,
	utils : {
		extract,
		collectConstructors
	},
	types,
} = require('..');


const UserType = define('UserType', function (userData) {
	const {
		email,
		password
	} = userData;
	this.email = email;
	this.password = password;
}, {
	email : '',
	password : '',
	description : 'UserType'
}, true);

UserType.define(() => {
	const UserTypePL1 = function () {
		this.user_pl_1_sign = 'pl_1';
	};
	UserTypePL1.prototype = {
		UserTypePL1 : 'UserTypePL_1'
	};
	return UserTypePL1;
}, true);

UserType.define(() => {
	const UserTypePL2 = function () {
		this.user_pl_2_sign = 'pl_2';
	};
	UserTypePL2.prototype = {
		UserTypePL2 : 'UserTypePL_2'
	};
	return UserTypePL2;
});

debugger;
const UserTypeConstructor = define(() => {
	
	const UserTypeConstructor = function (userData) {
		const {
			email,
			password
		} = userData;
		this.email = email;
		this.password = password;
	};
	
	UserTypeConstructor.prototype = {
		email : '',
		password : '',
		description : 'UserTypeConstructor'
	};
	
	return UserTypeConstructor;
	
});

const UserWithoutPassword = types.UserTypeConstructor.define(() => {
	const WithoutPassword = function () {
		this.password = undefined;
	};
	WithoutPassword.prototype = {
		WithoutPasswordSign : 'WithoutPasswordSign'
	};
	return WithoutPassword;
});


const WithAdditionalSign = UserWithoutPassword.define(() => {
	const WithAdditionalSign = function (sign) {
		this.sign = sign;
	};
	WithAdditionalSign.prototype = {
		WithAdditionalSignSign : 'WithAdditionalSignSign'
	};
	return WithAdditionalSign;
});

const MoreOver = WithAdditionalSign.define(() => {
	const MoreOver = function (str) {
		this.str = str || 'moreover str';
	};
	MoreOver.prototype = {
		MoreOverSign : 'MoreOverSign'
	};
	return MoreOver;
});

const OverMore = MoreOver.define(() => {
	const OverMore = function (str) {
		this.str = str || 're-defined OverMore str';
	};
	OverMore.prototype = {
		OverMoreSign : 'OverMoreSign'
	};
	return OverMore;
});

// const EvenMore = 
OverMore.define(() => {
	const EvenMore = function (str) {
		this.str = str || 're-defined EvenMore str';
	};
	EvenMore.prototype = {
		EvenMoreSign : 'EvenMoreSign'
	};
	return EvenMore;
});

// *****************************************************
// *****************************************************
// *****************************************************
const { deepEqual } = require('assert');


debugger;
process._rawDebug('new UserType >>>');
const user = new UserType({
	email : 'went.out@gmail.com',
	password : 321
});
debugger;
process._rawDebug('new user.UserTypePL1 >>>');
const userPL1 = new user.UserTypePL1();

console.log(collectConstructors(userPL1, true));
debugger;
process._rawDebug('new user.UserTypePL2 >>>');
const userPL2 = new user.UserTypePL2();
debugger;
process._rawDebug('new userPL1.UserTypePL2 >>>');
const userPL_1_2 = new userPL1.UserTypePL2();
process._rawDebug('userPL1.UserTypePL2 >>>');
const userPL_NoNew = userPL1.UserTypePL2();
// return;
deepEqual(user, {
	email : 'went.out@gmail.com',
	password : 321
});
deepEqual(userPL2, userPL_1_2, userPL_NoNew);

console.log('\nstart :\n');

console.log('1.1. ', user);
console.log('1.2.  proto : ', user.constructor.prototype); // UserType.prototype
console.log('1.3. ', user.constructor.name, '\n');

types;
debugger;
const userTC = new UserTypeConstructor({
	email : 'went.out@gmail.com',
	password : 123
});

console.log('2.1. ', userTC);
console.log('2.2.  proto : ', userTC.constructor.prototype); // UserTypeConstructor.prototype
console.log('2.3. ', userTC.constructor.name, '\n');


debugger;

const userWithoutPassword = new userTC.WithoutPassword();

console.log('3.1. ', userWithoutPassword);
console.log('3.2.  proto of proto : ', userWithoutPassword.constructor.prototype.constructor.prototype); // UserTypeConstructor.prototype
console.log('3.3. ', userWithoutPassword.constructor.name);

console.log('\n\n!!!!!!!!!!!', userWithoutPassword instanceof UserWithoutPassword);
console.log('!!!!!!!!!!!', userWithoutPassword instanceof UserTypeConstructor);
console.log();
console.log();
console.log('!!!!!! Must be False !!!!!', userTC instanceof UserWithoutPassword);
console.log();
debugger;

const userWithoutPassword_2 = new userTC.WithoutPassword();

console.log();
for (const name in userWithoutPassword_2) {
	console.log(`userWithoutPassword_2.${name} : `, userWithoutPassword_2[name]);
}

const userWPWithAdditionalSign = new userWithoutPassword_2.WithAdditionalSign('userWithoutPassword_2.WithAdditionalSign');
console.log();
for (const name in userWPWithAdditionalSign) {
	console.log(`userWithoutPassword_2_WithSign.${name} : `, userWPWithAdditionalSign[name]);
}

console.log('\n: >>> ', userWPWithAdditionalSign.constructor.prototype
	.constructor.prototype.constructor.prototype); // Mnemosyne

const moreOver = userWPWithAdditionalSign.MoreOver('moreOver str from data');
console.log();
for (const name in moreOver) {
	console.log(`moreOver.${name} : `, moreOver[name]);
}

const overMore = moreOver.OverMore();
console.log();
for (const name in overMore) {
	console.log(`OverMore.${name} : `, overMore[name]);
}

const evenMore = overMore.EvenMore();
console.log();
for (const name in evenMore) {
	console.log(`EvenMore.${name} : `, evenMore[name]);
}

const evenMoreConstructors = collectConstructors(evenMore);
console.log('\n evenMore Constructors : \n');


var base = types;
Object.keys(evenMoreConstructors)
	.reverse()
	.map((name, idx) => { 
		var iof = false;
		if (name === 'Object') {
			iof = evenMore instanceof Object;
		} else {
			if (base[name]) {
				iof = evenMore instanceof base[name];
				base = base[name].subtypes;
			}
		}
		return { idx, name, iof };
	})
		.reverse()
		.forEach(({idx, name, iof} = it) => console.log(idx, `${name}`, ` >> evenMore instanceof ${name} : `, iof));


console.log('\n evenMore Constructors Sequence : \n');
console.log(collectConstructors(evenMore, true));

console.log('\nfinish\n');

try {
	extract(null);
} catch (error) {
	console.error('BELOW IS AN EXAMPLE! of thrown error :');
	console.error(error);
}

debugger;
