'use strict';

var parseArgs = require('./parseArgs');

module.exports = function(argv, numPrimaryArgs) {
	numPrimaryArgs = numPrimaryArgs || 0;

	var args = parseArgs(argv);

	var orderedArgs = Object.keys(args).filter(function(argName) {
		var isNumeric = !isNaN(Number(argName));
		return isNumeric;
	}).map(function(argName) {
		return args[argName];
	});

	var primaryArgs = orderedArgs.slice(0, numPrimaryArgs);
	var secondaryArgs = orderedArgs.slice(numPrimaryArgs);

	var optionArgs = Object.keys(args).filter(function(argName) {
		var isNumeric = !isNaN(Number(argName));
		return !isNumeric;
	}).map(function(argName) {
		var key = (argName.length === 1 ? '-' : '--') + argName;
		var value = args[argName];
		return [key, value];
	}).reduce(function(args, keyValuePair) {
		return args.concat(keyValuePair);
	}, []);

	var combinedArgs = primaryArgs.concat(optionArgs).concat(secondaryArgs);

	return argv.slice(0, 2).concat(combinedArgs);
};
