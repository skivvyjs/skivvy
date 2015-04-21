'use strict';

var Promise = require('promise');

var resolvePackageModuleName = require('../helpers/resolvePackageModuleName');
var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');
var checkPackageExists = require('../helpers/checkPackageExists');
var checkProjectExists = require('../helpers/checkProjectExists');
var npmCommands = require('../helpers/npmCommands');

var api = require('../api');
var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;
var InvalidProjectError = require('../errors').InvalidProjectError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var projectPath = options.path || process.cwd();

	api.emit(events.UNINSTALL_PACKAGE_STARTED, {
		path: projectPath,
		package: packageName
	});
	return uninstallPackage(packageName, projectPath)
		.then(function() {
			api.emit(events.UNINSTALL_PACKAGE_COMPLETED, {
				path: projectPath,
				package: packageName
			});
		})
		.catch(function(error) {
			api.emit(events.UNINSTALL_PACKAGE_FAILED, {
				path: projectPath,
				package: packageName,
				error: error
			});
			throw error;
		})
		.nodeify(callback);
};

function uninstallPackage(packageName, projectPath) {
	return checkProjectExists(projectPath)
		.then(function(projectExists) {
			if (!projectExists) {
				throw new InvalidProjectError(projectPath);
			}
			if (!packageName) {
				throw new InvalidPackageError(packageName);
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
