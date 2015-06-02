'use strict';

var Promise = require('promise');

var formatTaskId = require('../helpers/formatTaskId');

var Api = require('../api');

var InvalidArgumentsError = Api.errors.InvalidArgumentsError;

module.exports = function(args, options, callback) {
	var taskName = options.task || null;
	var targetName = options.target || null;
	var packageName = options.package || null;
	var configUpdates = options.config || null;
	var projectPath = options.path || process.cwd();
	var environmentName = options.env || null;
	var operationName = args[0];

	switch (operationName) {
		case 'get':
			return getConfig(taskName, targetName, packageName, environmentName, projectPath)
				.nodeify(callback);

		case 'set':
			return setConfig(taskName, targetName, packageName, environmentName, configUpdates, projectPath)
				.nodeify(callback);

		default:
			return Promise.reject(new InvalidArgumentsError('Invalid config operation: "' + operationName + '"'))
				.nodeify(callback);
	}
};

function getConfig(taskName, targetName, packageName, environmentName, projectPath) {
	var api = new Api(projectPath, environmentName);

	return loadConfig(api, taskName, targetName, packageName)
		.then(function(config) {
			var formattedOutput = formatConfig(config);
			process.stdout.write(formattedOutput + '\n');
			return config;
		});


	function loadConfig(api, taskName, targetName, packageName, environmentName) {
		if (taskName) {
			var taskId = formatTaskId({
				package: packageName,
				task: taskName,
				target: targetName
			});
			return Promise.resolve(
				api.getTaskConfig({
					task: taskId,
					expand: false
				})
			);
		} else if (packageName) {
			return Promise.resolve(
				api.getPackageConfig({
					package: packageName,
					expand: false
				})
			);
		} else {
			return Promise.resolve(
				api.getEnvironmentConfig({
					expand: false
				})
			);
		}
	}

	function formatConfig(config) {
		return JSON.stringify(config, null, 2);
	}
}

function setConfig(taskName, targetName, packageName, environmentName, configUpdates, projectPath) {
	if (!configUpdates) {
		return Promise.reject(new InvalidArgumentsError('No config updates specified'));
	}

	var api = new Api(projectPath, environmentName);

	if (taskName) {
		var taskId = formatTaskId({
			package: packageName,
			task: taskName,
			target: targetName
		});
		return api.updateTaskConfig({
			task: taskId,
			updates: configUpdates
		});
	} else if (packageName) {
		return api.updatePackageConfig({
			package: packageName,
			updates: configUpdates
		});
	} else {
		return api.updateEnvironmentConfig({
			updates: configUpdates
		});
	}
}
