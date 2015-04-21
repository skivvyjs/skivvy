'use strict';

var checkProjectExists = require('../helpers/checkProjectExists');
var checkPackageExists = require('../helpers/checkPackageExists');
var resolvePackageModuleName = require('../helpers/resolvePackageModuleName');
var npmCommands = require('../helpers/npmCommands');

var api = require('../api');
var events = require('../events');

var InvalidPackageError = require('../errors').InvalidPackageError;
var InvalidProjectError = require('../errors').InvalidProjectError;

module.exports = function(options, callback) {
	options = options || {};
	var packageName = options.package || null;
	var projectPath = options.path || process.cwd();

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
					return npmCommands.update(moduleName, npmOptions, projectPath);
				});
		});
}
