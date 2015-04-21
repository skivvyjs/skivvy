'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var resolvePackagePath = require('./resolvePackagePath');

var InvalidProjectError = require('../errors').InvalidProjectError;
var InvalidPackageError = require('../errors').InvalidPackageError;

var TASK_NAME_PACKAGE_SEPARATOR = require('../../lib/constants').TASK_NAME_PACKAGE_SEPARATOR;

module.exports = function(packageName, projectPath, shouldIncludeVersion, callback) {
	return getPackage(packageName, projectPath, shouldIncludeVersion)
		.nodeify(callback);
};

function getPackage(packageName, projectPath, shouldIncludeVersion) {
	if (!projectPath) {
		return Promise.reject(new InvalidProjectError(projectPath));
	}
	if (!packageName) {
		return Promise.reject(new InvalidPackageError(packageName));
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
			return Promise.reject(new InvalidPackageError(packageName));
		}

		if (!shouldIncludeVersion) {
			return Promise.resolve(packageModule);
		} else {
			return getModuleVersion(packageName, modulePath)
				.then(function(moduleVersion) {
					packageModule.version = moduleVersion;
					return packageModule;
				});
		}


		function namePackageTasks(tasks, packageName) {
			var taskNames = Object.keys(tasks);
			taskNames.forEach(function(taskName) {
				var task = tasks[taskName];
				task.displayName = packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName;
			});
		}

		function getModuleVersion(packageName, modulePath) {
			return loadModuleConfig(modulePath)
				.then(function(pkg) {
					return pkg.version;
				})
				.catch(function(error) {
					throw new InvalidPackageError(packageName);
				});
		}

		function loadModuleConfig(modulePath) {
			return new Promise(function(resolve, reject) {
				var configPath = path.resolve(modulePath, 'package.json');
				fs.readFile(configPath, 'utf8', function(error, data) {
					if (error) { return reject(error); }
					var pkg;
					try {
						pkg = JSON.parse(data);
					} catch (error) {
						return reject(error);
					}
					return resolve(pkg);
				});
			});
		}
	}
}
