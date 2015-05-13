'use strict';

var Promise = require('promise');

var getPackage = require('./getPackage');
var resolveLocalTaskPath = require('./resolveLocalTaskPath');

var TASK_NAME_PACKAGE_SEPARATOR = require('../constants').TASK_NAME_PACKAGE_SEPARATOR;

var InvalidTaskError = require('../errors').InvalidTaskError;

module.exports = function(taskName, packageName, projectPath, callback) {
	return getTask(taskName, packageName, projectPath)
		.nodeify(callback);
};

function getTask(taskName, packageName, projectPath) {
	if (packageName) {
		return getExternalTask(taskName, packageName, projectPath);
	} else {
		return getLocalTask(taskName, projectPath);
	}


	function getExternalTask(taskName, packageName, projectPath) {
		return new Promise(function(resolve, reject) {
			var packageModule = getPackage(packageName, projectPath);
			var task = packageModule.tasks[taskName] || null;
			if (!task) {
				throw new InvalidTaskError(packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName);
			}
			return resolve(task);
		});
	}

	function getLocalTask(taskName, projectPath) {
		return new Promise(function(resolve, reject) {
			var taskPath = resolveLocalTaskPath(taskName, projectPath);
			var task;
			try {
				task = require(taskPath);
				task.displayName = taskName;
			} catch (error) {
				return reject(new InvalidTaskError(taskPath));
			}
			return resolve(task);
		});
	}
}
