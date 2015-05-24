'use strict';

var archy = require('archy');
var chalk = require('chalk');

var loadNpmConfig = require('../../lib/helpers/loadNpmConfig');

var Api = require('../api');

var TASK_NAME_PACKAGE_SEPARATOR = Api.constants.TASK_NAME_PACKAGE_SEPARATOR;

module.exports = function(args, options, callback) {
	var isQuietMode = options.quiet || false;
	var projectPath = options.path || process.cwd();
	return list(projectPath, isQuietMode)
		.nodeify(callback);
};

function list(projectPath, isQuietMode) {
	var api = new Api(projectPath);

	return api.listPackages({
		path: projectPath,
		versions: !isQuietMode
	})
		.then(function(packages) {
			var output = (isQuietMode ? getQuietOutput(packages) : getVerboseOutput(packages));
			process.stdout.write(output);
			return output;
		});

	function getQuietOutput(packages) {
		var taskNames = packages.map(function(packageModule) {
			var packageName = packageModule.name;
			var packageTaskNames = Object.keys(packageModule.tasks);
			return packageTaskNames.map(function(taskName) {
				if (!packageName) { return taskName; }
				return packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName;
			});
		}).reduce(function(taskNames, taskNameSet) {
			return taskNames.concat(taskNameSet);
		});
		return taskNames.join('\n') + '\n';
	}

	function getVerboseOutput(packages) {
		var pkg = loadNpmConfig(projectPath);
		var pkgLabel = pkg.name + '@' + pkg.version;

		var localTasks = packages.filter(function(packageModule) {
			var isLocalPackage = !packageModule.name;
			return isLocalPackage;
		}).map(function(packageModule) {
			var packageTasks = packageModule.tasks;
			var taskLabels = Object.keys(packageTasks).map(function(taskName) {
				var task = packageTasks[taskName];
				return getTaskLabel(taskName, task);
			});
			return taskLabels;
		}).reduce(function(localTasks, packageTaskLabels) {
			return localTasks.concat(packageTaskLabels);
		});

		var tree = localTasks.concat(packages.filter(function(packageModule) {
			var isLocalPackage = !packageModule.name;
			return !isLocalPackage;
		}).map(function(packageModule) {
			var packageLabel = getPackageLabel(packageModule);
			var packageTasks = packageModule.tasks;
			var taskLabels = Object.keys(packageTasks).map(function(taskName) {
				var task = packageTasks[taskName];
				return getTaskLabel(taskName, task);
			});
			if (taskLabels.length === 0) {
				taskLabels = [ chalk.dim('[ No tasks ]') ];
			}
			return {
				label: packageLabel,
				nodes: taskLabels
			};
		}));
		if (tree.length === 0) {
			tree = [ chalk.dim('[ No tasks ]') ];
		}
		return archy({
			label: pkgLabel,
			nodes: tree
		});


		function getPackageLabel(packageModule) {
			var isLocalPackage = packageModule.name === null;
			if (isLocalPackage) { return chalk.bold('Local tasks'); }
			var packageName = packageModule.name;
			var packageVersion = packageModule.version || '0.0.1';
			return chalk.bold(packageName) + '@' + packageVersion;
		}

		function getTaskLabel(taskName, task) {
			var taskDescription = task.description || null;
			return taskName + (taskDescription ? ' - ' + taskDescription : '');
		}
	}
}
