'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var timer = require('../utils/timer');

var api = require('../api');
var events = require('../events');

var getTask = require('../helpers/getTask');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var getMergedConfig = require('../helpers/getMergedConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');
var runAsync = require('../helpers/runAsync');

var getEnvironmentConfig = require('../api/getEnvironmentConfig');
var getPackageConfig = require('../api/getPackageConfig');
var getTaskConfig = require('../api/getTaskConfig');

var InvalidTaskError = require('../errors').InvalidTaskError;

var DEFAULT_TARGET_NAME = require('../constants').DEFAULT_TARGET_NAME;
var DEFAULT_ENVIRONMENT_NAME = require('../constants').DEFAULT_ENVIRONMENT_NAME;

module.exports = function(options, callback) {
	options = options || {};
	var task = options.task;
	var targetName = options.target || DEFAULT_TARGET_NAME;
	var packageName = options.package || null;
	var config = options.config || {};
	var environmentName = options.environment || DEFAULT_ENVIRONMENT_NAME;
	var projectPath = options.path || process.cwd();
	return run(task, targetName, packageName, environmentName, projectPath, config)
		.nodeify(callback);
};


function run(task, targetName, packageName, environmentName, projectPath, config) {
	if (!task) {
		return Promise.reject(new InvalidTaskError(task || null));
	} else if (typeof task === 'string') {
		return runNamedTask(task, targetName, packageName, environmentName, projectPath, config);
	} else if (typeof task === 'object' && typeof task.task === 'string') {
		var taskName = task.task;
		targetName = task.target;
		packageName = task.package;
		config = task.config || null;
		return runNamedTask(taskName, targetName, packageName, environmentName, projectPath, config);
	} else if (typeof task === 'function') {
		return runFunctionTask(task, config);
	} else if (typeof task === 'object' && typeof task.task === 'function') {
		var taskFunction = task.task;
		var taskConfig = task.config || null;
		return runFunctionTask(taskFunction, taskConfig);
	} else if (Array.isArray(task)) {
		return runCompositeTask(task, environmentName, projectPath, config);
	} else {
		return Promise.reject(new InvalidTaskError(task || null));
	}

	function runNamedTask(taskName, targetName, packageName, environmentName, projectPath, customConfig) {
		var task, taskConfig;
		try {
			task = getTask(taskName, packageName, projectPath);
			taskConfig = loadTaskConfig(taskName, targetName, packageName, environmentName, projectPath, customConfig);
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
			return runCompositeTask(targets, environmentName, projectPath, config);
		} else {
			return runFunctionTask(task, taskConfig);
		}


		function loadTaskConfig(taskName, targetName, packageName, environmentName, projectPath, customConfig) {
			var targetConfig = getTaskConfig({
				task: taskName,
				target: targetName,
				package: packageName,
				environment: environmentName,
				path: projectPath,
				expand: true
			});
			if (!customConfig || Object.keys(customConfig).length === 0) {
				return targetConfig;
			}
			var isTaskSet = Array.isArray(targetConfig);
			var targetsConfig = (isTaskSet ? targetConfig : [targetConfig]);
			var extendedTargetsConfig = targetsConfig.map(function(targetConfig) {
				var context = getTaskConfigOverrideContext(targetConfig, packageName, environmentName, projectPath);
				var expandedCustomConfig = expandConfigPlaceholders(customConfig, context);
				var extendedTargetConfig = getMergedConfig(targetConfig, expandedCustomConfig);
				return extendedTargetConfig;
			});
			return (isTaskSet ? extendedTargetsConfig : extendedTargetsConfig[0]);


			function getTaskConfigOverrideContext(taskConfig, packageName, environmentName, projectPath) {
				var isLocalTask = (packageName === null);
				if (isLocalTask) {
					return getLocalTaskConfigOverrideContext(taskConfig, environmentName, projectPath);
				} else {
					return getExternalTaskConfigOverrideContext(taskConfig, packageName, environmentName, projectPath);
				}


				function getLocalTaskConfigOverrideContext(taskConfig, environmentName, projectPath) {
					var pkg = loadNpmConfig(projectPath);
					var environmentConfig = getEnvironmentConfig({
						environment: environmentName,
						path: projectPath,
						expand: true
					});
					return {
						config: taskConfig,
						environment: environmentConfig,
						project: pkg
					};
				}

				function getExternalTaskConfigOverrideContext(taskConfig, packageName, environmentName, projectPath) {
					var pkg = loadNpmConfig(projectPath);
					var environmentConfig = getEnvironmentConfig({
						environment: environmentName,
						path: projectPath,
						expand: true
					});
					var packageConfig = getPackageConfig({
						package: packageName,
						environment: environmentName,
						path: projectPath,
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

	function runFunctionTask(task, config) {
		api.emit(events.TASK_STARTED, {
			task: task,
			config: config
		});
		var token = timer.start();
		return runTask(task, config)
			.then(function(returnValue) {
				var elapsedTime = timer.end(token);
				api.emit(events.TASK_COMPLETED, {
					result: returnValue,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				return returnValue;
			})
			.catch(function(error) {
				var elapsedTime = timer.end(token);
				api.emit(events.TASK_FAILED, {
					error: error,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				throw error;
			});

		function runTask(task, config) {
			config = config || {};
			var args = [config];
			var boundTask = task.bind(api);
			return runAsync(boundTask, args);
		}
	}

	function runCompositeTask(tasks, environmentName, projectPath, config) {
		var token = timer.start();
		api.emit(events.TASK_STARTED, {
			task: tasks,
			config: config
		});
		return Promise.resolve(mapSeries(tasks, function(task, index) {
			return run(task, null, null, environmentName, projectPath, config);
		}))
			.then(function(returnValue) {
				var elapsedTime = timer.end(token);
				api.emit(events.TASK_COMPLETED, {
					result: returnValue,
					task: task,
					config: config,
					elapsed: elapsedTime
				});
				return returnValue;
			})
			.catch(function(error) {
				var elapsedTime = timer.end(token);
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
