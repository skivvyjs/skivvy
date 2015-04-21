'use strict';

var loadConfigJson = require('../helpers/loadConfigJson');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var getEnvironmentConfig = require('./getEnvironmentConfig');
var getPackageConfig = require('./getPackageConfig');
var expandConfigPlaceholders = require('../helpers/expandConfigPlaceholders');

var InvalidTaskError = require('../errors').InvalidTaskError;

var DEFAULT_ENVIRONMENT_NAME = require('../constants').DEFAULT_ENVIRONMENT_NAME;
var DEFAULT_TARGET_NAME = require('../constants').DEFAULT_TARGET_NAME;

module.exports = function(options) {
	options = options || {};
	var taskName = options.task || null;
	var targetName = options.target || DEFAULT_TARGET_NAME;
	var packageName = options.package || null;
	var environmentName = options.environment || DEFAULT_ENVIRONMENT_NAME;
	var shouldExpandPlaceholders = options.expand || false;
	var projectPath = options.path || process.cwd();
	return getTaskConfig(taskName, targetName, packageName, environmentName, shouldExpandPlaceholders, projectPath);
};

function getTaskConfig(taskName, targetName, packageName, environmentName, shouldExpandPlaceholders, projectPath) {
	var config = loadConfigJson(projectPath);
	if (!taskName) {
		throw new InvalidTaskError(taskName);
	}

	var taskConfig = locateTaskConfig(taskName, targetName, packageName, config);

	if (shouldExpandPlaceholders) {
		taskConfig = expandTaskPlaceholders(taskConfig, packageName, environmentName, projectPath);
	}

	return taskConfig;


	function locateTaskConfig(taskName, targetName, packageName, config) {
		if (packageName) {
			return locateExternalTaskConfig(taskName, targetName, packageName, config);
		} else {
			return locateLocalTaskConfig(taskName, targetName, config);
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

		function locateLocalTaskConfig(taskName, targetName, config) {
			var tasksConfig = config.tasks || {};
			var taskSettings = tasksConfig[taskName] || {};
			var targetsConfig = taskSettings.targets || {};
			var targetConfig = resolveTargetConfig(targetName, targetsConfig);
			return targetConfig;
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

	function expandTaskPlaceholders(taskConfig, packageName, environmentName, projectPath) {
		var context = (
				packageName ?
					getExternalTaskContext(packageName, environmentName, projectPath)
				:
					getLocalTaskContext(environmentName, projectPath)
			);
		return expandConfigPlaceholders(taskConfig, context);


		function getLocalTaskContext(environmentName, projectPath) {
			var pkg = loadNpmConfig(projectPath);
			var environmentConfig = getEnvironmentConfig({
				environment: environmentName,
				path: projectPath,
				expand: true
			});
			return {
				project: pkg,
				environment: environmentConfig
			};
		}

		function getExternalTaskContext(packageName, environmentName, projectPath) {
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
				project: pkg,
				environment: environmentConfig,
				package: packageConfig
			};
		}
	}
}
