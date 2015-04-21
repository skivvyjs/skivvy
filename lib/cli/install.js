'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var api = require('../api');

var InvalidArgumentsError = api.errors.InvalidArgumentsError;

module.exports = function(args, options, callback) {
	var packageNames = args;
	var projectPath = options.path || process.cwd();
	return install(packageNames, projectPath)
		.nodeify(callback);
};


function install(packageNames, projectPath) {
	if (packageNames.length === 0) {
		return Promise.reject(new InvalidArgumentsError('No package specified'));
	}
	return Promise.resolve(mapSeries(packageNames, function(packageName) {
		api.installPackage({
			package: packageName,
			path: projectPath
		});
	}));
}
