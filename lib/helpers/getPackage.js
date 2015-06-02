'use strict';

var path = require('path');

var resolvePackagePath = require('./resolvePackagePath');

var InvalidProjectError = require('../errors').InvalidProjectError;
var InvalidPackageError = require('../errors').InvalidPackageError;

var TASK_NAME_PACKAGE_SEPARATOR = require('../../lib/constants').TASK_NAME_PACKAGE_SEPARATOR;

module.exports = function(packageName, projectPath, shouldIncludeVersion) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}
	if (!packageName) {
		throw new InvalidPackageError(packageName);
	}

	var modulePath = resolvePackagePath(packageName, projectPath);
	return loadPackageModule(modulePath, packageName, shouldIncludeVersion);


	function loadPackageModule(modulePath, packageName, shouldIncludeVersion, callback) {
		var packageModule;
		try {
			packageModule = require(modulePath);
			packageModule.name = packageName;
			namePackageTasks(packageModule.tasks, packageName);
		} catch (error) {
			var packageError = new InvalidPackageError(packageName);
			packageError.cause = error;
			throw packageError;
		}

		if (!shouldIncludeVersion) {
			return packageModule;
		} else {
			var moduleVersion = getModuleVersion(packageName, modulePath);
			packageModule.version = moduleVersion;
			return packageModule;
		}


		function namePackageTasks(tasks, packageName) {
			var taskNames = Object.keys(tasks);
			taskNames.forEach(function(taskName) {
				var task = tasks[taskName];
				task.displayName = packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName;
			});
		}

		function getModuleVersion(packageName, modulePath) {
			var configPath = path.resolve(modulePath, 'package.json');
			try {
				var pkg = require(configPath);
				return pkg.version;
			} catch (error) {
				var packageError = new InvalidPackageError(packageName);
				packageError.cause = error;
				throw packageError;
			}
		}
	}
};
