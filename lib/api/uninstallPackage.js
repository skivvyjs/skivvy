'use strict';

var Promise = require('promise');

var resolvePackageModuleName = require('../helpers/resolvePackageModuleName');
var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');
var checkPackageExists = require('../helpers/checkPackageExists');
var npmCommands = require('../helpers/npmCommands');

var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var projectPath = this.path;

	var api = this;

	api.emit(events.UNINSTALL_PACKAGE_STARTED, {
		package: packageName,
		path: projectPath
	});
	return uninstallPackage(packageName, projectPath)
		.then(function() {
			api.emit(events.UNINSTALL_PACKAGE_COMPLETED, {
				package: packageName,
				path: projectPath
			});
		})
		.catch(function(error) {
			api.emit(events.UNINSTALL_PACKAGE_FAILED, {
				error: error,
				package: packageName,
				path: projectPath
			});
			throw error;
		})
		.nodeify(callback);
};

function uninstallPackage(packageName, projectPath) {
	if (!packageName) {
		return Promise.reject(new InvalidPackageError(packageName));
	}

	return checkPackageExists(packageName, projectPath)
		.then(function(packageExists) {
			if (!packageExists) { throw new InvalidPackageError(packageName); }

			var npmOptions = {
				'save-dev': true
			};
			var moduleName = resolvePackageModuleName(packageName);
			return npmCommands.uninstall(moduleName, npmOptions, projectPath)
				.then(function() {
					return removeConfigPackageNamespace(packageName, projectPath)
						.then(function() { });
				});
		});


	function removeConfigPackageNamespace(packageName, projectPath) {
		return new Promise(function(resolve, reject) {
			var config = loadConfigJson(projectPath);
			config.packages = config.packages || {};
			if (!config.packages.hasOwnProperty(packageName)) {
				return resolve();
			}
			delete config.packages[packageName];
			return resolve(
				saveConfigJson(projectPath, config)
			);
		});
	}
}
