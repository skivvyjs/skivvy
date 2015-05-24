'use strict';

var Promise = require('promise');

var checkPackageExists = require('../helpers/checkPackageExists');
var resolvePackageModuleName = require('../helpers/resolvePackageModuleName');
var npmCommands = require('../helpers/npmCommands');

var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var projectPath = this.path;

	var api = this;

	api.emit(events.UPDATE_PACKAGE_STARTED, {
		path: projectPath,
		package: packageName
	});
	return updatePackage(packageName, projectPath)
		.then(function(version) {
			api.emit(events.UPDATE_PACKAGE_COMPLETED, {
				path: projectPath,
				package: packageName,
				version: version
			});
			return version;
		})
		.catch(function(error) {
			api.emit(events.UPDATE_PACKAGE_FAILED, {
				path: projectPath,
				package: packageName,
				error: error
			});
			throw error;
		})
		.nodeify(callback);
};

function updatePackage(packageName, projectPath) {
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
			return npmCommands.update(moduleName, npmOptions, projectPath);
		});
}
