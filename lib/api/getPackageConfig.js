'use strict';

var loadConfigJson = require('../helpers/loadConfigJson');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var getPackage = require('../helpers/getPackage');
var getMergedConfig = require('../helpers/getMergedConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');

var InvalidPackageError = require('../errors').InvalidPackageError;

module.exports = function(options) {
	options = options || {};
	var packageName = options.package || null;
	var shouldExpandPlaceholders = options.expand || false;
	var projectPath = this.path;
	var api = this;
	return getPackageConfig(packageName, shouldExpandPlaceholders, api, projectPath);
};

function getPackageConfig(packageName, shouldExpandPlaceholders, api, projectPath) {
	var config = loadConfigJson(projectPath);
	if (!packageName) {
		throw new InvalidPackageError(packageName);
	}

	var packageConfig = loadPackageConfig(packageName, projectPath, config);

	if (shouldExpandPlaceholders) {
		packageConfig = expandPackagePlaceholders(packageConfig, projectPath);
	}

	return packageConfig;


	function loadPackageConfig(packageName, projectPath, config) {
		var defaultPackageConfig = loadDefaultPackageConfig(packageName, projectPath);
		var customPackageConfig = locatePackageConfig(packageName, config);
		var packageConfig = getMergedConfig(defaultPackageConfig, customPackageConfig);
		return packageConfig;


		function loadDefaultPackageConfig(packageName, projectPath) {
			var shouldIncludeVersion = false;
			var packageModule = getPackage(packageName, projectPath, shouldIncludeVersion);
			var packageDefaults = packageModule.defaults || null;
			return packageDefaults;
		}

		function locatePackageConfig(packageName, config) {
			var packagesConfig = config.packages || {};
			var packageSettings = packagesConfig[packageName] || {};
			var packageConfig = packageSettings.config || {};
			return packageConfig;
		}
	}

	function expandPackagePlaceholders(packageConfig, projectPath) {
		var pkg = loadNpmConfig(projectPath);
		var environmentConfig = api.getEnvironmentConfig({
			expand: true
		});
		var context = {
			project: pkg,
			environment: environmentConfig
		};
		return expandConfigPlaceholders(packageConfig, context);
	}
}
