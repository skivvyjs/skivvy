'use strict';

var minimist = require('minimist');

module.exports = function(argv) {
	var args = minimist(argv.slice(2));

	var options = Object.keys(args).filter(function(arg) {
		return arg !== '_';
	}).reduce(function(options, arg) {
		var value = parseValue(args[arg]);
		options[arg] = value;
		return options;
	}, {});

	var additionalArgs = args['_'];

	var combinedArgs = options;
	combinedArgs = additionalArgs.reduce(function(combinedArgs, arg, index) {
		combinedArgs[index] = arg;
		return combinedArgs;
	}, combinedArgs);

	return combinedArgs;


	function parseValue(value) {
		if (!value) {
			return value;
		} else if (value === 'true') {
			return true;
		} else if (value === 'false') {
			return false;
		} else if (Array.isArray(value)) {
			return value.map(function(item) { return parseValue(item); });
		} else if (typeof value === 'object') {
			return Object.keys(value).reduce(function(output, key) {
				output[key] = parseValue(value[key]);
				return output;
			}, {});
		} else if (typeof value === 'string') {
			var firstChar = value.charAt(0);
			if (firstChar === '{' || firstChar === '[') {
				try {
					value = JSON.parse(value);
					return parseValue(value);
				} catch (error) {}
			}
			return value;
		} else {
			return value;
		}
	}
};
