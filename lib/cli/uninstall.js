'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var api = require('../api');

var InvalidArgumentsError = api.errors.InvalidArgumentsError;

module.exports = function(args, options, callback) {
	var packageNames = args;
	var projectPath = options.path || process.cwd();
	return uninstall(packageNames, projectPath)
		.nodeify(callback);
};


function uninstall(packageNames, projectPath) {
	if (packageNames.length === 0) {
		return Promise.reject(new InvalidArgumentsError('No task specified'));
	}
	return Promise.resolve(mapSeries(packageNames, function(packageName) {
		api.uninstallPackage({
			package: packageName,
			path: projectPath
		});
	}));
}
