'use strict';

var Promise = require('promise');

var Api = require('../api');

var InvalidArgumentsError = Api.errors.InvalidArgumentsError;

module.exports = function(args, options, callback) {
	var taskName = options.task || null;
	var targetName = options.target || null;
	var packageName = options.package || null;
	var environmentName = options.env || null;
	var configUpdates = options.config || null;
	var projectPath = options.path || process.cwd();
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
	var api = new Api(projectPath);

	return loadConfig(api, taskName, targetName, packageName, environmentName)
		.then(function(config) {
			var formattedOutput = formatConfig(config);
			process.stdout.write(formattedOutput + '\n');
			return config;
		});


	function loadConfig(api, taskName, targetName, packageName, environmentName) {
		if (taskName) {
			return Promise.resolve(
				api.getTaskConfig({
					task: taskName,
					target: targetName,
					package: packageName,
					environment: environmentName,
					expand: false
				})
			);
		} else if (packageName) {
			return Promise.resolve(
				api.getPackageConfig({
					package: packageName,
					environment: environmentName,
					expand: false
				})
			);
		} else {
			return Promise.resolve(
				api.getEnvironmentConfig({
					environment: environmentName,
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

	var api = new Api(projectPath);

	if (taskName) {
		return api.updateTaskConfig({
			task: taskName,
			target: targetName,
			package: packageName,
			updates: configUpdates,
			environment: environmentName
		});
	} else if (packageName) {
		return api.updatePackageConfig({
			package: packageName,
			updates: configUpdates,
			environment: environmentName
		});
	} else {
		return api.updateEnvironmentConfig({
			updates: configUpdates,
			environment: environmentName
		});
	}
}
