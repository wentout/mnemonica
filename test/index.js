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
	function UserTypeConstructor ({
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
	password : 123
});

console.log(user);
console.log(user.constructor.prototype);
console.log(user.constructor.name);

const userC = new UserTypeConstructor({
	email : 'went.out@gmail.com',
	password : 123
});

console.log(userC);
console.log(userC.constructor.prototype);
console.log(userC.constructor.name);

debugger;

// process.exit(0);