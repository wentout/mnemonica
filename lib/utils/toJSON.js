'use strict';

const extract = require('./extract');
module.exports = function (instance) {

	const extracted = extract(instance);
	return Object.entries(extracted).reduce((o, entry) => {

		const [name, _value] = entry;
		let value;

		try {
			value = JSON.stringify(_value);
		} catch (error) {
			const description = 'This value type is not supported by JSON.stringify';
			const {
				stack,
				message
			} = error;

			value = JSON.stringify({
				description,
				stack,
				message
			});
		}

		o += `"${name}":${value},`;
		return o;

	}, '{').replace(/,$/, '}');

};
