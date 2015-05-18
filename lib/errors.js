'use strict';

exports.InvalidCwdError = createError('InvalidCwdError', 'Unable to set working directory to {0}');
exports.InvalidArgumentsError = createError('InvalidArgumentsError', 'Invalid arguments: {0}');
exports.InvalidProjectError = createError('InvalidProjectError', 'Invalid project: {0}');
exports.InvalidConfigError = createError('InvalidConfigError', 'Invalid config: {0}');
exports.InvalidPackageError = createError('InvalidPackageError', 'Invalid package: {0}');
exports.InvalidNpmModuleError = createError('InvalidNpmModuleError', 'Invalid npm module: {0}');
exports.InvalidTaskError = createError('InvalidTaskError', 'Invalid task: {0}');
exports.InvalidTargetError = createError('InvalidTargetError', 'Invalid target: {0}');
exports.MultipleMatchingTasksError = createError('MultipleMatchingTasksError', 'Multiple tasks matched: {0}');


function createError(type, message) {

	function CustomError() {
		var args = arguments;
		this.message = message.replace(/\{(\d+)\}/g, function(match, index) {
			return String(args[index]);
		});
		Error.captureStackTrace(this);
	}

	CustomError.prototype = Object.create(Error.prototype);

	CustomError.prototype.name = type;

	return CustomError;
}
