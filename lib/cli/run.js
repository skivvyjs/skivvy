'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var Api = require('../api');

var getPackage = require('../helpers/getPackage');
var getPackages = require('../helpers/getPackages');
var getLocalTaskPackage = require('../helpers/getLocalTaskPackage');
var resolveLocalTaskPath = require('../helpers/resolveLocalTaskPath');

var escapeRegexp = require('escape-regexp');
var mapSeries = require('promise-map-series');

var InvalidCwdError = Api.errors.InvalidCwdError;
var InvalidArgumentsError = Api.errors.InvalidArgumentsError;
var InvalidProjectError = Api.errors.InvalidProjectError;
var InvalidTaskError = Api.errors.InvalidTaskError;
var MultipleMatchingTasksError = Api.errors.MultipleMatchingTasksError;

var TASK_NAME_PACKAGE_SEPARATOR = Api.constants.TASK_NAME_PACKAGE_SEPARATOR;
var TASK_NAME_TARGET_SEPARATOR = Api.constants.TASK_NAME_TARGET_SEPARATOR;
var TASK_NAME_PATTERN = new RegExp('^(?:(.+)' + escapeRegexp(TASK_NAME_PACKAGE_SEPARATOR) + ')?(.+?)(?:' + escapeRegexp(TASK_NAME_TARGET_SEPARATOR) + '(.+))?$');

module.exports = function(args, options, callback) {
	var taskNames = args;
	var customConfig = options.config || null;
	var environmentName = options.env || null;
	var cwd = options.cwd || null;
	if (cwd) {
		try {
			process.chdir(cwd);
		} catch (error) {
			return Promise.reject(new InvalidCwdError(cwd)).nodeify(callback);
		}
	}
	var projectPath = options.path || null;
	if (projectPath) {
		projectPath = path.resolve(projectPath);
		if (!cwd) {
			try {
				process.chdir(projectPath);
			} catch (error) {
				return Promise.reject(new InvalidProjectError(projectPath)).nodeify(callback);
			}
		}
	}
	projectPath = projectPath || process.cwd();
	return run(taskNames, environmentName, customConfig, projectPath, cwd)
		.nodeify(callback);
};

function run(taskNames, environmentName, customConfig, projectPath, cwd) {
	if (taskNames.length === 0) {
		return Promise.reject(new InvalidArgumentsError('No task specified'));
	}

	var api = new Api(projectPath);

	return Promise.resolve(mapSeries(taskNames, function(taskName) {
		return launchTask(taskName);
	}));


	function launchTask(combinedPackageTaskTargetName) {
		var results = TASK_NAME_PATTERN.exec(combinedPackageTaskTargetName) || [];
		var packageName = results[1] || null;
		var taskName = results[2] || null;
		var targetName = results[3] || null;

		return findMatchingTaskPackages(taskName, packageName, projectPath)
			.then(function(packageModules) {
				var hasMatches = packageModules.length > 0;
				var hasLocalMatch = hasMatches && (packageModules[0].name === null);
				var hasMultipleMatches = !hasLocalMatch && (packageModules.length > 1);
				if (!hasMatches) {
					throw new InvalidTaskError(taskName);
				}
				if (hasMultipleMatches) {
					throw new MultipleMatchingTasksError(taskName);
				}

				var packageModule = packageModules[0];
				var packageName = packageModule.name;

				return api.run({
					task: taskName,
					target: targetName,
					package: packageName,
					environment: environmentName,
					path: projectPath,
					config: customConfig
				});
			});


		function findMatchingTaskPackages(taskName, packageName, projectPath) {
			if (packageName) {
				return getNamedPackage(packageName, projectPath)
					.then(function(packageModule) {
						return [packageModule];
					});
			} else {
				return getFilteredTaskPackages(taskName, projectPath);
			}


			function getNamedPackage(packageName, projectPath) {
				return new Promise(function(resolve, reject) {
					var packageModule = getPackage(packageName, projectPath);
					return resolve(packageModule);
				});
			}

			function getFilteredTaskPackages(taskName, projectPath) {
				return Promise.all([
					getMatchingLocalTaskPackages(taskName, projectPath),
					getMatchingExternalTaskPackages(taskName, projectPath)
				])
				.then(function(values) {
					var matchingLocalPackages = values[0];
					var matchingExternalPackages = values[1];
					var matchingPackages = matchingLocalPackages.concat(matchingExternalPackages);
					return matchingPackages;
				});


				function getMatchingLocalTaskPackages(taskName, projectPath) {
					return verifyLocalTask(taskName, projectPath)
						.then(function(taskExists) {
							if (taskExists) {
								return getLocalTaskPackage(projectPath)
									.then(function(localPackage) {
										return [localPackage];
									});
							} else {
								return [];
							}
						});

					function verifyLocalTask(taskName, projectPath) {
						return new Promise(function(resolve, reject) {
							var taskPath = resolveLocalTaskPath(taskName, projectPath);
							fs.stat(taskPath, function(error, stats) {
								var taskExists = !error && Boolean(stats);
								return resolve(taskExists);
							});
						});
					}
				}

				function getMatchingExternalTaskPackages(taskName, projectPath) {
					var shouldIncludeVersions = false;
					return getPackages(projectPath, shouldIncludeVersions)
						.then(function(packages) {
							var matchingPackages = packages.filter(function(packageModule) {
								return packageModule.tasks.hasOwnProperty(taskName);
							});
							return matchingPackages;
						});
				}
			}
		}
	}
}
