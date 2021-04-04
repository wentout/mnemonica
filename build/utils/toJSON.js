'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
exports.toJSON = void 0;
const extract_1 = require('./extract');
const toJSON = (instance) => {
	const extracted = extract_1.extract(instance);
	return Object.entries(extracted).reduce((o, entry) => {
		const [name, _value] = entry;
		if ([null, undefined].includes(_value)) {
			return o;
		}
		let value;
		try {
			value = JSON.stringify(_value);
		}
		catch (error) {
			const description = 'This value type is not supported by JSON.stringify';
			const { stack, message } = error;
			value = JSON.stringify({
				description,
				stack,
				message
			});
		}
		o += `"${name}":${value},`;
		return o;
	}, '{')
		.replace(/,$/, '}');
};
exports.toJSON = toJSON;
