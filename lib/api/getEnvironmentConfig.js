'use strict';

var loadConfigJson = require('../helpers/loadConfigJson');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');

module.exports = function(options) {
	options = options || {};
	var shouldExpandPlaceholders = options.expand || false;
	var projectPath = this.path;
	var environmentName = this.environment;
	return getEnvironmentConfig(environmentName, shouldExpandPlaceholders, projectPath);
};

function getEnvironmentConfig(environmentName, shouldExpandPlaceholders, projectPath) {
	var config = loadConfigJson(projectPath);

	var environmentConfig = locateEnvironmentConfig(environmentName, projectPath, config);

	if (shouldExpandPlaceholders) {
		environmentConfig = expandProjectPlaceholders(environmentConfig, projectPath);
	}

	return environmentConfig;


	function locateEnvironmentConfig(environmentName, projectPath, config) {
		var environments = config.environment || {};
		var environmentConfig = environments[environmentName] || {};
		while (typeof environmentConfig === 'string') {
			environmentConfig = environments[environmentConfig];
		}
		return environmentConfig;
	}

	function expandProjectPlaceholders(environmentConfig, projectPath) {
		var pkg = loadNpmConfig(projectPath);
		var context = {
			project: pkg
		};
		return expandConfigPlaceholders(environmentConfig, context);
	}
}
