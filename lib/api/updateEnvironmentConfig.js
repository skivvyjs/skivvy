'use strict';

var Promise = require('promise');
var extend = require('extend');

var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');

var api = require('../api');
var events = require('../events');

var InvalidConfigError = require('../errors').InvalidConfigError;

var DEFAULT_ENVIRONMENT_NAME = require('../constants').DEFAULT_ENVIRONMENT_NAME;

module.exports = function(options, callback) {
	options = options || {};
	var environmentName = options.environment || DEFAULT_ENVIRONMENT_NAME;
	var configUpdates = options.updates || null;
	var projectPath = options.path || process.cwd();
	api.emit(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, {
		environment: environmentName,
		updates: configUpdates,
		path: projectPath
	});
	return updateEnvironmentConfig(environmentName, configUpdates, projectPath)
		.then(function(returnValue) {
			api.emit(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, {
				config: returnValue,
				environment: environmentName,
				updates: configUpdates,
				path: projectPath
			});
			return returnValue;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, {
				error: error,
				environment: environmentName,
				updates: configUpdates,
				path: projectPath
			});
			throw error;
		})
		.nodeify(callback);
};

function updateEnvironmentConfig(environmentName, configUpdates, projectPath) {
	var config;
	try {
		config = loadConfigJson(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}
	if (!configUpdates || (typeof configUpdates !== 'object') || Array.isArray(configUpdates)) {
		return Promise.reject(new InvalidConfigError(configUpdates));
	}
	var globalConfigUpdates = {
		environment: {}
	};
	globalConfigUpdates.environment[environmentName] = configUpdates;
	var updatedConfig = updateConfig(config, globalConfigUpdates);
	return saveConfigJson(projectPath, updatedConfig)
		.then(function(savedConfig) {
			return savedConfig.environment[environmentName];
		});


	function updateConfig(config, updates) {
		var deepMerge = true;
		var updatedConfig = extend(deepMerge, {}, config, updates);
		return updatedConfig;
	}
}
