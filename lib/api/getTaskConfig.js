'use strict';

var loadConfigJson = require('../helpers/loadConfigJson');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');
var getTask = require('../helpers/getTask');
var getMergedConfig = require('../helpers/getMergedConfig');

var InvalidTaskError = require('../errors').InvalidTaskError;

var DEFAULT_TARGET_NAME = require('../constants').DEFAULT_TARGET_NAME;

module.exports = function(options) {
	options = options || {};
	var taskName = options.task || null;
	var targetName = options.target || DEFAULT_TARGET_NAME;
	var packageName = options.package || null;
	var shouldExpandPlaceholders = options.expand || false;
	var projectPath = this.path;
	var api = this;
	return getTaskConfig(taskName, targetName, packageName, shouldExpandPlaceholders, api, projectPath);
};

function getTaskConfig(taskName, targetName, packageName, shouldExpandPlaceholders, api, projectPath) {
	var config = loadConfigJson(projectPath);
	if (!taskName) {
		throw new InvalidTaskError(taskName);
	}

	var taskConfig = locateTaskConfig(taskName, targetName, packageName, projectPath, config);

	if (shouldExpandPlaceholders) {
		taskConfig = expandTaskPlaceholders(taskConfig, packageName, api, projectPath);
	}

	return taskConfig;


	function locateTaskConfig(taskName, targetName, packageName, projectPath, config) {
		if (packageName) {
			return loadExternalTaskConfig(taskName, targetName, packageName, projectPath, config);
		} else {
			return loadLocalTaskConfig(taskName, targetName, projectPath, config);
		}

		function loadExternalTaskConfig(taskName, targetName, packageName, projectPath, config) {
			var defaultTaskConfig = loadDefaultExternalTaskConfig(taskName, packageName, projectPath);
			var customTaskConfig = locateExternalTaskConfig(taskName, targetName, packageName, config);
			var isTaskSet = Array.isArray(customTaskConfig);
			var targetsConfig = isTaskSet ? customTaskConfig : [customTaskConfig];
			var extendedTargetsConfig = targetsConfig.map(function(targetConfig) {
				return getMergedConfig(defaultTaskConfig, targetConfig);
			});
			return (isTaskSet ? extendedTargetsConfig : extendedTargetsConfig[0]);


			function loadDefaultExternalTaskConfig(taskName, packageName, projectPath) {
				var task = getTask(taskName, packageName, projectPath);
				var taskDefaults = task.defaults || null;
				return taskDefaults;
			}

			function locateExternalTaskConfig(taskName, targetName, packageName, config) {
				var packagesConfig = config.packages || {};
				var packageSettings = packagesConfig[packageName] || {};
				var tasksConfig = packageSettings.tasks || {};
				var taskSettings = tasksConfig[taskName] || {};
				var targetsConfig = taskSettings.targets || {};
				var targetConfig = resolveTargetConfig(targetName, targetsConfig);
				return targetConfig;
			}
		}

		function loadLocalTaskConfig(taskName, targetName, projectPath, config) {
			var defaultTaskConfig = loadDefaultLocalTaskConfig(taskName, projectPath);
			var customTaskConfig = locateLocalTaskConfig(taskName, targetName, config);
			var isTaskSet = Array.isArray(customTaskConfig);
			var targetsConfig = isTaskSet ? customTaskConfig : [customTaskConfig];
			var extendedTargetsConfig = targetsConfig.map(function(targetConfig) {
				return getMergedConfig(defaultTaskConfig, targetConfig);
			});
			return (isTaskSet ? extendedTargetsConfig : extendedTargetsConfig[0]);


			function loadDefaultLocalTaskConfig(taskName, projectPath) {
				var packageName = null;
				var task = getTask(taskName, packageName, projectPath);
				var taskDefaults = task.defaults || null;
				return taskDefaults;
			}

			function locateLocalTaskConfig(taskName, targetName, config) {
				var tasksConfig = config.tasks || {};
				var taskSettings = tasksConfig[taskName] || {};
				var targetsConfig = taskSettings.targets || {};
				var targetConfig = resolveTargetConfig(targetName, targetsConfig);
				return targetConfig;
			}
		}

		function resolveTargetConfig(targetName, targets) {
			var targetConfig = expandTargetConfigLinks(targets[targetName] || {});
			return targetConfig;


			function expandTargetConfigLinks(targetConfig) {
				if (typeof targetConfig === 'string') {
					return resolveTargetConfig(targetConfig, targets);
				} else if (Array.isArray(targetConfig)) {
					var targetsConfig = targetConfig;
					return targetsConfig.map(function(targetConfig) {
						return expandTargetConfigLinks(targetConfig);
					});
				} else {
					return targetConfig;
				}
			}
		}
	}

	function expandTaskPlaceholders(taskConfig, packageName, api, projectPath) {
		var context = (
				packageName ?
					getExternalTaskContext(packageName, api, projectPath)
				:
					getLocalTaskContext(api, projectPath)
			);
		return expandConfigPlaceholders(taskConfig, context);


		function getLocalTaskContext(api, projectPath) {
			var pkg = loadNpmConfig(projectPath);
			var environmentConfig = api.getEnvironmentConfig({
				expand: true
			});
			return {
				project: pkg,
				environment: environmentConfig
			};
		}

		function getExternalTaskContext(packageName, api, projectPath) {
			var pkg = loadNpmConfig(projectPath);
			var environmentConfig = api.getEnvironmentConfig({
				expand: true
			});
			var packageConfig = api.getPackageConfig({
				package: packageName,
				expand: true
			});
			return {
				project: pkg,
				environment: environmentConfig,
				package: packageConfig
			};
		}
	}
}
