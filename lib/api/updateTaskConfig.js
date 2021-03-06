'use strict';

var Promise = require('promise');

var parseTaskId = require('../helpers/parseTaskId');
var loadConfigJson = require('../helpers/loadConfigJson');
var checkTaskExists = require('../helpers/checkTaskExists');
var saveConfigJson = require('../helpers/saveConfigJson');
var getMergedConfig = require('../helpers/getMergedConfig');

var events = require('../events');

var InvalidTaskError = require('../errors').InvalidTaskError;
var InvalidConfigError = require('../errors').InvalidConfigError;

module.exports = function(options, callback) {
	var taskId = options.task || null;
	var configUpdates = options.updates || null;
	var projectPath = this.path;

	var api = this;

	api.emit(events.UPDATE_TASK_CONFIG_STARTED, {
		task: taskId,
		updates: configUpdates,
		path: projectPath
	});
	return updateTaskConfig(taskId, configUpdates, projectPath)
		.then(function(returnValue) {
			api.emit(events.UPDATE_TASK_CONFIG_COMPLETED, {
				config: returnValue,
				task: taskId,
				updates: configUpdates,
				path: projectPath
			});
			return returnValue;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_TASK_CONFIG_FAILED, {
				error: error,
				task: taskId,
				updates: configUpdates,
				path: projectPath
			});
			throw error;
		})
		.nodeify(callback);
};

function updateTaskConfig(taskId, configUpdates, projectPath) {
	var config;
	try {
		config = loadConfigJson(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}

	var taskDetails = parseTaskId(taskId);
	if (!taskDetails) {
		return Promise.reject(new InvalidTaskError(taskId));
	}
	var taskName = taskDetails.task;
	var packageName = taskDetails.package;
	var targetName = taskDetails.target;

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
			globalConfigUpdates.tasks[taskName].targets[targetName] = configUpdates;
			return globalConfigUpdates;
		}

		function getExternalTaskConfigUpdates(taskName, targetName, packageName, configUpdates, config) {
			var globalConfigUpdates = {
				packages: {}
			};
			globalConfigUpdates.packages[packageName] = {
				tasks: {}
			};
			globalConfigUpdates.packages[packageName].tasks[taskName] = {
				targets: {}
			};
			globalConfigUpdates.packages[packageName].tasks[taskName].targets[targetName] = configUpdates;
			return globalConfigUpdates;
		}
	}
}
