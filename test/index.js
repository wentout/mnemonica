'use strict';

const {
	define,
	types,
} = require('..');


const UserType = define('UserType', function ({
	email,
	password
} = userData) {
	this.email = email;
	this.password = password;
}, {
	email : '',
	password : '',
	zzz : 'zzz'
});

const UserTypeConstructor = define(() => {
	
	const UserTypeConstructor = function ({
		email,
		password
	} = userData) {
		this.email = email;
		this.password = password;
	};
	
	UserTypeConstructor.prototype = {
		email : '',
		password : ''
	};
	
	return UserTypeConstructor;
	
});

const UserWithoutPassword = UserTypeConstructor.define(() => {
	const WithoutPassword = function () {
		this.password = undefined;
	};
	WithoutPassword.prototype = {};
	return WithoutPassword;
});


const WithAdditionalSign = UserWithoutPassword.define(() => {
	const WithAdditionalSign = function (sign) {
		this.sign = sign;
	};
	return WithAdditionalSign;
});

const MoreOver = WithAdditionalSign.define(() => {
	const MoreOver = function (str) {
		this.str = str || 'moreover str';
	};
	return MoreOver;
});

const OverMore = MoreOver.define(() => {
	const OverMore = function (str) {
		this.str = str || 're-defined OverMore str';
	};
	OverMore.prototype = {};
	return OverMore;

});


debugger;

const user = new UserType({
	email : 'went.out@gmail.com',
	password : 321
});

console.log('1.1. ', user);
console.log('1.2. ', user.constructor.prototype);
console.log('1.3. ', user.constructor.name);


const userTC = new UserTypeConstructor({
	email : 'went.out@gmail.com',
	password : 123
});

console.log('2.1. ', userTC);
console.log('2.2. ', userTC.constructor.prototype);
console.log('2.3. ', userTC.constructor.name);


debugger;

const userWithoutPassword = new userTC.WithoutPassword();

console.log('3.1. ', userWithoutPassword);
console.log('3.2. ', userWithoutPassword.constructor.prototype);
console.log('3.3. ', userWithoutPassword.constructor.name);


debugger;

const userWithoutPassword_2 = new userTC.WithoutPassword();

console.log();
for (const name in userWithoutPassword_2) {
	console.log(`userWithoutPassword_2.${name} : `, userWithoutPassword_2[name]);
}


debugger;

const userWPWithAdditionalSign = new userWithoutPassword_2.WithAdditionalSign('zzzz');
console.log();
for (const name in userWPWithAdditionalSign) {
	console.log(`userWithoutPassword_2_WithSign.${name} : `, userWPWithAdditionalSign[name]);
}



const moreOver = userWPWithAdditionalSign.MoreOver('sssssssssssssssssss');
console.log();
for (const name in moreOver) {
	console.log(`moreOver.${name} : `, moreOver[name]);
}




const overMore = moreOver.OverMore();
console.log();
for (const name in overMore) {
	console.log(`OverMore.${name} : `, overMore[name]);
}


debugger;
