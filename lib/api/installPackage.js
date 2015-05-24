'use strict';

var Promise = require('promise');

var resolvePackageModuleName = require('../helpers/resolvePackageModuleName');
var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');
var npmCommands = require('../helpers/npmCommands');

var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var projectPath = this.path;

	var api = this;

	api.emit(events.INSTALL_PACKAGE_STARTED, {
		path: projectPath,
		package: packageName
	});
	return installPackage(packageName, projectPath)
		.then(function(version) {
			api.emit(events.INSTALL_PACKAGE_COMPLETED, {
				path: projectPath,
				package: packageName,
				version: version
			});
			return version;
		})
		.catch(function(error) {
			api.emit(events.INSTALL_PACKAGE_FAILED, {
				path: projectPath,
				package: packageName,
				error: error
			});
			throw error;
		})
		.nodeify(callback);
};

function installPackage(packageName, projectPath) {
	if (!packageName) {
		return Promise.reject(new InvalidPackageError(packageName));
	}
	var npmOptions = {
		'save-dev': true
	};
	var moduleName = resolvePackageModuleName(packageName);
	return npmCommands.install(moduleName, npmOptions, projectPath)
		.then(function(packageVersion) {
			return addConfigPackageNamespace(packageName, projectPath)
				.then(function() {
					return packageVersion;
				});
		});


	function addConfigPackageNamespace(packageName, projectPath) {
		return new Promise(function(resolve, reject) {
			var config = loadConfigJson(projectPath);
			config.packages = config.packages || {};
			if (config.packages.hasOwnProperty(packageName)) {
				return resolve(config.packages[packageName]);
			}
			config.packages[packageName] = {
				config: {},
				tasks: {}
			};
			return resolve(
				saveConfigJson(projectPath, config)
					.then(function(updatedConfig) {
						return updatedConfig.packages[packageName].config;
					})
			);
		});
	}
}
