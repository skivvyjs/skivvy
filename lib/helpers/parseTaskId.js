'use strict';

var escapeRegexp = require('escape-regexp');

var DEFAULT_TARGET_NAME = require('../constants').DEFAULT_TARGET_NAME;
var TASK_NAME_PACKAGE_SEPARATOR = require('../constants').TASK_NAME_PACKAGE_SEPARATOR;
var TASK_NAME_TARGET_SEPARATOR = require('../constants').TASK_NAME_TARGET_SEPARATOR;
var TASK_NAME_PATTERN = new RegExp('^(?:(.+)' + escapeRegexp(TASK_NAME_PACKAGE_SEPARATOR) + ')?(.+?)(?:' + escapeRegexp(TASK_NAME_TARGET_SEPARATOR) + '(.+))?$');

module.exports = function(taskId) {
	if (!taskId) { return null; }
	var results = TASK_NAME_PATTERN.exec(taskId);
	var packageName = results[1] || null;
	var taskName = results[2] || null;
	var targetName = results[3] || DEFAULT_TARGET_NAME;
	return {
		package: packageName,
		task: taskName,
		target: targetName
	};
};
