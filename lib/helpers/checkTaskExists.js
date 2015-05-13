'use strict';

var fs = require('fs');
var Promise = require('promise');

var resolveLocalTaskPath = require('./resolveLocalTaskPath');
var getPackage = require('./getPackage');

var InvalidTaskError = require('../errors').InvalidTaskError;

module.exports = function(taskName, packageName, projectPath, callback) {
	return checkTaskExists(taskName, packageName, projectPath)
		.nodeify(callback);
};

function checkTaskExists(taskName, packageName, projectPath) {
	if (!taskName) {
		return Promise.reject(new InvalidTaskError(taskName));
	}
	if (packageName) {
		return checkExternalTaskExists(taskName, packageName, projectPath);
	} else {
		return checkLocalTaskExists(taskName, projectPath);
	}


	function checkExternalTaskExists(taskName, packageName, projectPath) {
		return new Promise(function(resolve, reject) {
			var shouldIncludeVersions = false;
			var packageModule = getPackage(packageName, projectPath, shouldIncludeVersions);
			var packageTasks = packageModule.tasks;
			var task = packageTasks[taskName] || null;
			var taskExists = Boolean(task);
			return resolve(taskExists);
		});
	}

	function checkLocalTaskExists(taskName, projectPath) {
		return new Promise(function(resolve, reject) {
			var taskPath = resolveLocalTaskPath(taskName, projectPath);
			fs.stat(taskPath, function(error, stat) {
				if (error && error.code === 'ENOENT') {
					return resolve(false);
				}
				if (error) { return reject(error); }
				var taskExists = stat.isFile();
				return resolve(taskExists);
			});
		});
	}
}
