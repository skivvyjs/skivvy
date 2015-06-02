'use strict';

var path = require('path');

var resolvePackagePath = require('./resolvePackagePath');
var formatTaskId = require('./formatTaskId');

var InvalidProjectError = require('../errors').InvalidProjectError;
var InvalidPackageError = require('../errors').InvalidPackageError;

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
			var module = loadModule(modulePath);
			packageModule = parsePackage(module, packageName);
		} catch (error) {
			var packageError = new InvalidPackageError(packageName);
			packageError.cause = error;
			throw packageError;
		}

		if (shouldIncludeVersion) {
			packageModule.version = getModuleVersion(packageName, modulePath);
		}

		return packageModule;


		function loadModule(modulePath) {
			return require(modulePath);
		}

		function parsePackage(module, packageName) {
			return {
				name: packageName,
				tasks: parsePackageTasks(module, packageName),
				defaults: parsePackageDefaults(module)
			};


			function parsePackageTasks(module, packageName) {
				var moduleTasks = module.tasks;
				var taskNames = Object.keys(moduleTasks);
				return taskNames.reduce(function(packageTasks, taskName) {
					var task = moduleTasks[taskName];
					task.displayName = formatTaskId({
						package: packageName,
						task: taskName
					});
					packageTasks[taskName] = task;
					return packageTasks;
				}, {});
			}

			function parsePackageDefaults(module) {
				return module.defaults || {};
			}
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
