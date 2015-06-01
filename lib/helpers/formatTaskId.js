'use strict';

module.exports = function(task) {
	var taskName = task.task;
	var packageName = task.package;
	var targetName = task.target;

	if (!taskName) { return null; }

	var taskId = (packageName ? packageName + '::' : '') +
		taskName +
		(targetName ? ':' + targetName : '');

	return taskId;
};
