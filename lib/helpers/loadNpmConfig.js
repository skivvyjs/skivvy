'use strict';

var path = require('path');

var InvalidProjectError = require('../errors').InvalidProjectError;
var InvalidNpmModuleError = require('../errors').InvalidNpmModuleError;

module.exports = function(projectPath, callback) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}
	var packageJsonPath = path.resolve(projectPath, 'package.json');
	var pkg;
	try {
		pkg = require(packageJsonPath);
	} catch (error) {
		var npmModuleError = new InvalidNpmModuleError(packageJsonPath);
		npmModuleError.cause = error;
		throw npmModuleError;
	}
	return pkg;
};
