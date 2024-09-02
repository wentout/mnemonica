'use strict';

const sss = async function () {
	this.m = 1;
};

console.log(Object.hasOwnProperty.call(sss, 'prototype'));
try {
	new sss;
} catch (error) {
	console.error(error);
}
