'use strict';

var Promise = require('promise');

var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');
var getMergedConfig = require('../helpers/getMergedConfig');

var events = require('../events');

var InvalidConfigError = require('../errors').InvalidConfigError;

module.exports = function(options, callback) {
	options = options || {};
	var configUpdates = options.updates || null;
	var projectPath = this.path;
	var environmentName = this.environment;
	var api = this;

	api.emit(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, {
		updates: configUpdates,
		path: projectPath,
		environment: environmentName
	});
	return updateEnvironmentConfig(environmentName, configUpdates, projectPath)
		.then(function(returnValue) {
			api.emit(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, {
				config: returnValue,
				updates: configUpdates,
				path: projectPath,
				environment: environmentName
			});
			return returnValue;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, {
				error: error,
				updates: configUpdates,
				path: projectPath,
				environment: environmentName
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
	var updatedConfig = getMergedConfig(config, globalConfigUpdates);
	return saveConfigJson(projectPath, updatedConfig)
		.then(function(savedConfig) {
			return savedConfig.environment[environmentName];
		});
}
