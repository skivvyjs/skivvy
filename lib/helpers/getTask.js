'use strict';

var getPackage = require('./getPackage');
var resolveLocalTaskPath = require('./resolveLocalTaskPath');

var TASK_NAME_PACKAGE_SEPARATOR = require('../constants').TASK_NAME_PACKAGE_SEPARATOR;

var InvalidTaskError = require('../errors').InvalidTaskError;

module.exports = function(taskName, packageName, projectPath) {
	if (packageName) {
		return getExternalTask(taskName, packageName, projectPath);
	} else {
		return getLocalTask(taskName, projectPath);
	}


	function getExternalTask(taskName, packageName, projectPath) {
		var packageModule = getPackage(packageName, projectPath);
		var task = packageModule.tasks[taskName] || null;
		if (!task) {
			throw new InvalidTaskError(packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName);
		}
		return task;
	}

	function getLocalTask(taskName, projectPath) {
		var taskPath = resolveLocalTaskPath(taskName, projectPath);
		var task;
		try {
			task = require(taskPath);
			task.displayName = taskName;
		} catch (error) {
			var taskError = new InvalidTaskError(taskPath);
			taskError.cause = error;
			throw taskError;
		}
		return task;
	}
};
