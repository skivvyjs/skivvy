'use strict';

var path = require('path');

var loadConfigJson = require('./loadConfigJson');

var InvalidProjectError = require('../errors').InvalidProjectError;
var InvalidTaskError = require('../errors').InvalidTaskError;

var LOCAL_TASKS_PATH = require('../constants').LOCAL_TASKS_PATH;

module.exports = function(taskName, projectPath) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}
	if (!taskName) {
		throw new InvalidTaskError(taskName);
	}
	var config = loadConfigJson(projectPath);
	var includePath = (config.hasOwnProperty('include') ? config.include : LOCAL_TASKS_PATH);
	var localTasksPath = path.join(projectPath, includePath);
	var taskPath = path.join(localTasksPath, taskName + '.js');
	return path.resolve(taskPath);
};
