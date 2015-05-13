'use strict';

var Promise = require('promise');

var loadConfigJson = require('../helpers/loadConfigJson');
var checkTaskExists = require('../helpers/checkTaskExists');
var saveConfigJson = require('../helpers/saveConfigJson');
var getMergedConfig = require('../helpers/getMergedConfig');

var api = require('../api');
var events = require('../events');

var InvalidTaskError = require('../errors').InvalidTaskError;
var InvalidConfigError = require('../errors').InvalidConfigError;

var DEFAULT_TARGET_NAME = require('../constants').DEFAULT_TARGET_NAME;

module.exports = function(options, callback) {
	var taskName = options.task || null;
	var targetName = options.target || DEFAULT_TARGET_NAME;
	var configUpdates = options.updates || null;
	var packageName = options.package;
	var projectPath = options.path || process.cwd();

	api.emit(events.UPDATE_TASK_CONFIG_STARTED, {
		task: taskName,
		target: targetName,
		package: packageName,
		updates: configUpdates,
		path: projectPath
	});
	return updateTaskConfig(taskName, targetName, packageName, configUpdates, projectPath)
		.then(function(returnValue) {
			api.emit(events.UPDATE_TASK_CONFIG_COMPLETED, {
				config: returnValue,
				task: taskName,
				target: targetName,
				package: packageName,
				updates: configUpdates,
				path: projectPath
			});
			return returnValue;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_TASK_CONFIG_FAILED, {
				error: error,
				task: taskName,
				target: targetName,
				package: packageName,
				updates: configUpdates,
				path: projectPath
			});
			throw error;
		})
		.nodeify(callback);
};

function updateTaskConfig(taskName, targetName, packageName, configUpdates, projectPath) {
	var config;
	try {
		config = loadConfigJson(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}
	return checkTaskExists(taskName, packageName, projectPath)
		.then(function(taskExists) {
			if (!taskExists) {
				throw new InvalidTaskError(taskName);
			}
			if (!configUpdates) {
				throw new InvalidConfigError(configUpdates);
			}
			var globalConfigUpdates = getConfigUpdates(taskName, targetName, packageName, configUpdates);
			var updatedConfig = getMergedConfig(config, globalConfigUpdates);
			return saveConfigJson(projectPath, updatedConfig)
				.then(function(savedConfig) {
					return getTaskConfig(taskName, targetName, packageName, savedConfig);


					function getTaskConfig(taskName, targetName, packageName, config) {
						if (packageName) {
							return config.packages[packageName].tasks[taskName].targets[targetName];
						} else {
							return config.tasks[taskName].targets[targetName];
						}
					}
				});
		});


	function getConfigUpdates(taskName, targetName, packageName, configUpdates) {
		if (packageName) {
			return getExternalTaskConfigUpdates(taskName, targetName, packageName, configUpdates);
		} else {
			return getLocalTaskConfigUpdates(taskName, targetName, configUpdates);
		}

		function getLocalTaskConfigUpdates(taskName, targetName, configUpdates) {
			var globalConfigUpdates = {
				tasks: {}
			};
			globalConfigUpdates.tasks[taskName] = {
				targets: {}
			};
			globalConfigUpdates.tasks[taskName].targets[DEFAULT_TARGET_NAME] = {};
			globalConfigUpdates.tasks[taskName].targets[targetName] = configUpdates;
			return globalConfigUpdates;
		}

		function getExternalTaskConfigUpdates(taskName, targetName, packageName, configUpdates, config) {
			var globalConfigUpdates = {
				packages: {}
			};
			globalConfigUpdates.packages[packageName] = {
				config: {},
				tasks: {}
			};
			globalConfigUpdates.packages[packageName].tasks[taskName] = {
				targets: {}
			};
			globalConfigUpdates.packages[packageName].tasks[taskName].targets[DEFAULT_TARGET_NAME] = {};
			globalConfigUpdates.packages[packageName].tasks[taskName].targets[targetName] = configUpdates;
			return globalConfigUpdates;
		}
	}
}
