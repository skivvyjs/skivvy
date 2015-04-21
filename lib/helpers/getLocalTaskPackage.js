'use strict';

var path = require('path');
var Promise = require('promise');
var glob = require('glob');

var loadConfigJson = require('./loadConfigJson');
var getTask = require('./getTask');

var InvalidProjectError = require('../errors').InvalidProjectError;

var LOCAL_TASKS_PATH = require('../constants').LOCAL_TASKS_PATH;

module.exports = function(projectPath, callback) {
	return getLocalTaskPackage(projectPath)
		.nodeify(callback);
};

function getLocalTaskPackage(projectPath) {
	if (!projectPath) {
		return Promise.reject(new InvalidProjectError(projectPath));
	}
	var config;
	try {
		config = loadConfigJson(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}

	var localIncludePath = (config.hasOwnProperty('include') ? config.include : LOCAL_TASKS_PATH);
	return getLocalTasks(localIncludePath)
		.then(function(tasks) {
			return {
				name: null,
				tasks: tasks
			};
		});


	function getLocalTasks(includePath) {
		return new Promise(function(resolve, reject) {
			var localTasksPath = path.join(projectPath, includePath);
			var pattern = '*.js';
			glob(pattern, { cwd: localTasksPath }, function(error, relativeFilenames) {
				if (error) { return reject(error); }
				var taskPaths = relativeFilenames.map(function(relativeFilename) {
					return path.join(localTasksPath, relativeFilename);
				});
				return resolve(loadTasks(taskPaths));
			});
		});
	}

	function loadTasks(taskPaths) {
		var taskNames = taskPaths.map(function(taskPath) {
			return path.basename(taskPath, '.js');
		});
		return Promise.all(taskNames.map(function(taskName, index) {
			var packageName = null;
			return getTask(taskName, packageName, projectPath);
		})).then(function(tasks) {
			return tasks.reduce(function(tasks, task, index) {
				var taskName = taskNames[index];
				tasks[taskName] = task;
				return tasks;
			}, {});
		});
	}
}
