'use strict';

var fs = require('fs');
var Promise = require('promise');

var api = require('../api');

var getPackage = require('../helpers/getPackage');
var getPackages = require('../helpers/getPackages');
var getLocalTaskPackage = require('../helpers/getLocalTaskPackage');
var resolveLocalTaskPath = require('../helpers/resolveLocalTaskPath');

var escapeRegexp = require('escape-regexp');
var mapSeries = require('promise-map-series');

var InvalidArgumentsError = api.errors.InvalidArgumentsError;
var InvalidTaskError = api.errors.InvalidTaskError;
var MultipleMatchingTasksError = api.errors.MultipleMatchingTasksError;

var TASK_NAME_PACKAGE_SEPARATOR = api.constants.TASK_NAME_PACKAGE_SEPARATOR;
var TASK_NAME_TARGET_SEPARATOR = api.constants.TASK_NAME_TARGET_SEPARATOR;
var TASK_NAME_PATTERN = new RegExp('^(?:(.+)' + escapeRegexp(TASK_NAME_PACKAGE_SEPARATOR) + ')?(.+?)(?:' + escapeRegexp(TASK_NAME_TARGET_SEPARATOR) + '(.+))?$');

module.exports = function(args, options, callback) {
	var taskNames = args;
	var customConfig = options.config || null;
	var environmentName = options.environment || null;
	var projectPath = options.path || process.cwd();
	return run(taskNames, environmentName, customConfig, projectPath)
		.nodeify(callback);
};

function run(taskNames, environmentName, customConfig, projectPath) {
	if (taskNames.length === 0) {
		return Promise.reject(new InvalidArgumentsError('No task specified'));
	}
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
				return getNamedPackages(packageName, projectPath);
			} else {
				return getFilteredTaskPackages(taskName, projectPath);
			}


			function getNamedPackages(packageName, projectPath) {
				return getPackage(packageName, projectPath)
					.then(function(packageModule) {
						return [packageModule];
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
