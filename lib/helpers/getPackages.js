'use strict';

var path = require('path');
var Promise = require('promise');
var glob = require('glob');
var escapeRegexp = require('escape-regexp');

var getPackage = require('./getPackage');

var InvalidProjectError = require('../errors').InvalidProjectError;

var MODULE_PREFIX = require('../constants').MODULE_PREFIX;
var OFFICIAL_PACKAGE_SCOPE = require('../constants').OFFICIAL_PACKAGE_SCOPE;

var PACKAGE_PATH_GLOB = '@*/' + MODULE_PREFIX + '*';
var PACKAGE_PATH_REGEXP = new RegExp('^(@.+)/' + escapeRegexp(MODULE_PREFIX) + '(.+)$');

module.exports = function(projectPath, shouldIncludeVersions, callback) {
	return getPackages(projectPath, shouldIncludeVersions)
		.nodeify(callback);
};

function getPackages(projectPath, shouldIncludeVersions) {
	if (!projectPath) {
		return Promise.reject(new InvalidProjectError(projectPath));
	}

	return locatePackages(projectPath)
		.then(function(modulePaths) {
			return Promise.all(modulePaths.map(function(modulePath) {
				var packageName = getPackageName(modulePath, projectPath);
				return getPackage(packageName, projectPath, shouldIncludeVersions);
			}));
		});


	function locatePackages(projectPath) {
		return new Promise(function(resolve, reject) {
			var modulesPath = path.join(projectPath, 'node_modules');
			var pattern = PACKAGE_PATH_GLOB;
			glob(pattern, { cwd: modulesPath }, function(error, relativeFilenames) {
				if (error) { return reject(error); }
				var modulePaths = relativeFilenames.map(function(relativeFilename) {
					var modulePath = path.join(modulesPath, relativeFilename);
					return modulePath;
				});
				return resolve(modulePaths);
			});
		});
	}

	function getPackageName(modulePath, projectPath) {
		var modulesPath = path.join(projectPath, 'node_modules');
		var relativePath = path.relative(modulesPath, modulePath);
		var result = PACKAGE_PATH_REGEXP.exec(relativePath);
		if (!result) { return null; }
		var scopeName = result[1];
		var packageName = result[2];
		return (scopeName === OFFICIAL_PACKAGE_SCOPE ? packageName : scopeName + '/' + packageName);
	}
}
