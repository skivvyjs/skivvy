'use strict';

var Promise = require('promise');

var getLocalTaskPackage = require('../helpers/getLocalTaskPackage');
var getPackages = require('../helpers/getPackages');

module.exports = function(options, callback) {
	options = options || {};
	var shouldIncludeVersions = options.versions || false;
	var projectPath = options.path || process.cwd();
	return listPackages(projectPath, shouldIncludeVersions)
		.nodeify(callback);
};

function listPackages(projectPath, shouldIncludeVersions) {
	return Promise.all([
		getLocalTaskPackage(projectPath),
		getPackages(projectPath, shouldIncludeVersions)
	])
		.then(function(values) {
			var localPackage = values[0];
			var externalPackages = values[1];
			return [localPackage].concat(externalPackages);
		});
}
