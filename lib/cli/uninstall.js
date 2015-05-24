'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var Api = require('../api');

var InvalidArgumentsError = Api.errors.InvalidArgumentsError;

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

	var api = new Api(projectPath);

	return Promise.resolve(mapSeries(packageNames, function(packageName) {
		api.uninstallPackage({
			package: packageName
		});
	}));
}
