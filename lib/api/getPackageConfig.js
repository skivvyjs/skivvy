'use strict';

var loadConfigJson = require('../helpers/loadConfigJson');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var getEnvironmentConfig = require('./getEnvironmentConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');

var InvalidPackageError = require('../errors').InvalidPackageError;

var DEFAULT_ENVIRONMENT_NAME = require('../constants').DEFAULT_ENVIRONMENT_NAME;

module.exports = function(options) {
	options = options || {};
	var packageName = options.package || null;
	var environmentName = options.environment || DEFAULT_ENVIRONMENT_NAME;
	var shouldExpandPlaceholders = options.expand || false;
	var projectPath = options.path || process.cwd();
	return getPackageConfig(packageName, environmentName, shouldExpandPlaceholders, projectPath);
};

function getPackageConfig(packageName, environmentName, shouldExpandPlaceholders, projectPath) {
	var config = loadConfigJson(projectPath);
	if (!packageName) {
		throw new InvalidPackageError(packageName);
	}

	var packageConfig = locatePackageConfig(packageName, config);

	if (shouldExpandPlaceholders) {
		packageConfig = expandPackagePlaceholders(packageConfig, environmentName, projectPath);
	}

	return packageConfig;


	function locatePackageConfig(packageName, config) {
		var packagesConfig = config.packages || {};
		var packageSettings = packagesConfig[packageName] || {};
		var packageConfig = packageSettings.config || {};
		return packageConfig;
	}

	function expandPackagePlaceholders(packageConfig, environmentName, projectPath) {
		var pkg = loadNpmConfig(projectPath);
		var environmentConfig = getEnvironmentConfig({
			path: projectPath,
			environment: environmentName,
			expand: true
		});
		var context = {
			project: pkg,
			environment: environmentConfig
		};
		return expandConfigPlaceholders(packageConfig, context);
	}
}