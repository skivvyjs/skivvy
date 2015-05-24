'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var Api = require('../api');

var InvalidArgumentsError = Api.errors.InvalidArgumentsError;

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

	var api = new Api(projectPath);

	return Promise.resolve(mapSeries(packageNames, function(packageName) {
		api.installPackage({
			package: packageName,
			path: projectPath
		});
	}));
}
