'use strict';

var extend = require('extend');
var Promise = require('promise');

var loadConfigJson = require('../helpers/loadConfigJson');
var checkPackageExists = require('../helpers/checkPackageExists');
var saveConfigJson = require('../helpers/saveConfigJson');

var api = require('../api');
var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;
var InvalidConfigError = require('../errors').InvalidConfigError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var configUpdates = options.updates || null;
	var projectPath = options.path || process.cwd();
	api.emit(events.UPDATE_PACKAGE_CONFIG_STARTED, {
		package: packageName,
		updates: configUpdates,
		path: projectPath
	});
	return updatePackageConfig(packageName, configUpdates, projectPath)
		.then(function(returnValue) {
			api.emit(events.UPDATE_PACKAGE_CONFIG_COMPLETED, {
				config: returnValue,
				package: packageName,
				updates: configUpdates,
				path: projectPath
			});
			return returnValue;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_PACKAGE_CONFIG_FAILED, {
				error: error,
				package: packageName,
				updates: configUpdates,
				path: projectPath
			});
			throw error;
		})
		.nodeify(callback);
};

function updatePackageConfig(packageName, configUpdates, projectPath) {
	var config;
	try {
		config = loadConfigJson(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}

	return checkPackageExists(packageName, projectPath)
		.then(function(packageExists) {
			if (!packageExists) {
				throw new InvalidPackageError(packageName);
			}
			if (!configUpdates || (typeof configUpdates !== 'object') || Array.isArray(configUpdates)) {
				throw new InvalidConfigError(configUpdates);
			}
			var globalConfigUpdates = {
				packages: {}
			};
			globalConfigUpdates.packages[packageName] = {
				config: configUpdates
			};
			var updatedConfig = updateConfig(config, globalConfigUpdates);
			return saveConfigJson(projectPath, updatedConfig)
				.then(function(savedConfig) {
					return savedConfig.packages[packageName].config;
				});
		});


	function updateConfig(config, updates) {
		var deepMerge = true;
		var updatedConfig = extend(deepMerge, {}, config, updates);
		return updatedConfig;
	}
}
