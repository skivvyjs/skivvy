'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var events = require('../events');

var parseTaskId = require('../helpers/parseTaskId');
var getTask = require('../helpers/getTask');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var getMergedConfig = require('../helpers/getMergedConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');
var runAsync = require('../helpers/runAsync');

var InvalidTaskError = require('../errors').InvalidTaskError;

module.exports = function(options, callback) {
	options = options || {};
	var taskId = options.task;
	var config = options.config || {};
	var api = this;
	var projectPath = this.path;
	return run(taskId, api, projectPath, config)
		.nodeify(callback);
};


function run(task, api, projectPath, config) {
	if (!task) {
		return Promise.reject(new InvalidTaskError(task));
	} else if (typeof task === 'string') {
		return runNamedTask(task, api, projectPath, config);
	} else if (typeof task === 'function') {
		return runFunctionTask(task, config, api);
	} else if (typeof task === 'object' && task.hasOwnProperty('task') && task.hasOwnProperty('config')) {
		if (typeof task.task === 'string') {
			return runNamedTask(task.task, api, projectPath, task.config);
		} else if (typeof task.task === 'function') {
			return runFunctionTask(task.task, task.config, api);
		} else {
			return Promise.reject(new InvalidTaskError(task));
		}
	} else if (Array.isArray(task)) {
		return runCompositeTask(task, api, projectPath, config);
	} else {
		return Promise.reject(new InvalidTaskError(task));
	}

	function runNamedTask(taskId, api, projectPath, config) {
		var task, taskConfig;
		try {
			task = loadTask(taskId);
			taskConfig = loadTaskConfig(taskId, api, projectPath, config);
		} catch (error) {
			return Promise.reject(error);
		}
		var isTaskSet = Array.isArray(taskConfig);
		if (isTaskSet) {
			var targets = taskConfig.map(function(targetConfig) {
				return {
					task: task,
					config: targetConfig
				};
			});
			return runCompositeTask(targets, api, projectPath, config);
		} else {
			return run(task, api, projectPath, taskConfig);
		}


		function loadTask(taskId) {
			var taskDetails = parseTaskId(taskId);
			if (!taskDetails) {
				throw new InvalidTaskError(taskId);
			}
			var packageName = taskDetails.package;
			var taskName = taskDetails.task;
			return getTask(taskName, packageName, projectPath);
		}

		function loadTaskConfig(taskId, api, projectPath, customConfig) {
			var targetConfig = api.getTaskConfig({
				task: taskId,
				expand: true
			});
			if (!customConfig || Object.keys(customConfig).length === 0) {
				return targetConfig;
			}
			var isTaskSet = Array.isArray(targetConfig);
			var targetsConfig = (isTaskSet ? targetConfig : [targetConfig]);
			var extendedTargetsConfig = targetsConfig.map(function(targetConfig) {
				var context = getTaskConfigOverrideContext(targetConfig, taskId, api, projectPath);
				var expandedCustomConfig = expandConfigPlaceholders(customConfig, context);
				var extendedTargetConfig = getMergedConfig(targetConfig, expandedCustomConfig);
				return extendedTargetConfig;
			});
			return (isTaskSet ? extendedTargetsConfig : extendedTargetsConfig[0]);


			function getTaskConfigOverrideContext(taskConfig, taskId, api, projectPath) {
				var taskDetails = parseTaskId(taskId);
				var packageName = taskDetails.package;
				var isLocalTask = (packageName === null);
				if (isLocalTask) {
					return getLocalTaskConfigOverrideContext(taskConfig, api, projectPath);
				} else {
					return getExternalTaskConfigOverrideContext(taskConfig, packageName, api, projectPath);
				}


				function getLocalTaskConfigOverrideContext(taskConfig, api, projectPath) {
					var pkg = loadNpmConfig(projectPath);
					var environmentConfig = api.getEnvironmentConfig({
						expand: true
					});
					return {
						config: taskConfig,
						environment: environmentConfig,
						project: pkg
					};
				}

				function getExternalTaskConfigOverrideContext(taskConfig, packageName, api, projectPath) {
					var pkg = loadNpmConfig(projectPath);
					var environmentConfig = api.getEnvironmentConfig({
						expand: true
					});
					var packageConfig = api.getPackageConfig({
						package: packageName,
						expand: true
					});
					return {
						config: taskConfig,
						package: packageConfig,
						environment: environmentConfig,
						project: pkg
					};
				}
			}
		}
	}

	function runFunctionTask(task, config, api) {
		api.emit(events.TASK_STARTED, {
			task: task,
			config: config
		});
		var token = api.utils.timer.start();
		return runTask(task, config, api)
			.then(function(returnValue) {
				var elapsedTime = api.utils.timer.end(token);
				api.emit(events.TASK_COMPLETED, {
					result: returnValue,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				return returnValue;
			})
			.catch(function(error) {
				var elapsedTime = api.utils.timer.end(token);
				api.emit(events.TASK_FAILED, {
					error: error,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				throw error;
			});

		function runTask(task, config, thisArg) {
			config = config || {};
			var args = [config];
			var boundTask = task.bind(thisArg);
			return runAsync(boundTask, args);
		}
	}

	function runCompositeTask(tasks, api, projectPath, config) {
		var token = api.utils.timer.start();
		api.emit(events.TASK_STARTED, {
			task: tasks,
			config: config
		});
		return Promise.resolve(mapSeries(tasks, function(task, index) {
			var isAnonymousTask = typeof task === 'function';
			if (isAnonymousTask) {
				task = {
					task: task,
					config: config
				};
			}
			return run(task, api, projectPath, null);
		}))
			.then(function(returnValue) {
				var elapsedTime = api.utils.timer.end(token);
				api.emit(events.TASK_COMPLETED, {
					result: returnValue,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				return returnValue;
			})
			.catch(function(error) {
				var elapsedTime = api.utils.timer.end(token);
				api.emit(events.TASK_FAILED, {
					error: error,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				throw error;
			});
	}
}
