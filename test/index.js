'use strict';

const {
	define
} = require('..');

const UserType = define('UserType', function ({
	email,
	password
} = userData) {
	this.email = email;
	this.password = password;
}, {
	email : '',
	password : ''
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

const user = new UserType({
	email : 'went.out@gmail.com',
	password : 321
});

console.log('1.1. ', user);
console.log('1.2. ', user.constructor.prototype);
console.log('1.3. ', user.constructor.name);

const userC = new UserTypeConstructor({
	email : 'went.out@gmail.com',
	password : 123
});

console.log('2.1. ', userC);
console.log('2.2. ', userC.constructor.prototype);
console.log('2.3. ', userC.constructor.name);

debugger;

// process.exit(0);