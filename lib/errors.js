'use strict';

var createError = require('error-system').createError;

exports.InvalidArgumentsError = createError('InvalidArgumentsError', 'Invalid arguments: {0}');
exports.InvalidProjectError = createError('InvalidProjectError', 'Invalid project: {0}');
exports.InvalidConfigError = createError('InvalidConfigError', 'Invalid config: {0}');
exports.InvalidPackageError = createError('InvalidPackageError', 'Invalid package: {0}');
exports.InvalidNpmModuleError = createError('InvalidNpmModuleError', 'Invalid npm module: {0}');
exports.InvalidTaskError = createError('InvalidTaskError', 'Invalid task: {0}');
exports.InvalidTargetError = createError('InvalidTargetError', 'Invalid target: {0}');
exports.MultipleMatchingTasksError = createError('MultipleMatchingTasksError', 'Multiple tasks matched: {0}');
