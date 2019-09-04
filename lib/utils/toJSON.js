'use strict';

module.exports = function (instance) {
	return JSON.stringify(this || instance);
};