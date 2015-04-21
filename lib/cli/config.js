'use strict';

var Promise = require('promise');

var api = require('../api');

var InvalidArgumentsError = api.errors.InvalidArgumentsError;

module.exports = function(args, options, callback) {
	var taskName = options.task || null;
	var targetName = options.target || null;
	var packageName = options.package || null;
	var environmentName = options.environment || null;
	var configUpdates = options.config || null;
	var projectPath = options.path || process.cwd();
	return config(taskName, targetName, packageName, environmentName, configUpdates, projectPath)
		.nodeify(callback);
};

function config(taskName, targetName, packageName, environmentName, configUpdates, projectPath) {
	if (!configUpdates) {
		return Promise.reject(new InvalidArgumentsError('No config updates specified'));
	}

	if (taskName) {
		return api.updateTaskConfig({
			task: taskName,
			target: targetName,
			package: packageName,
			updates: configUpdates,
			environment: environmentName,
			path: projectPath
		});
	} else if (packageName) {
		return api.updatePackageConfig({
			package: packageName,
			updates: configUpdates,
			environment: environmentName,
			path: projectPath
		});
	} else {
		return api.updateEnvironmentConfig({
			updates: configUpdates,
			environment: environmentName,
			path: projectPath
		});
	}
}
