'use strict';

var path = require('path');

var resolvePackageModuleName = require('./resolvePackageModuleName');

var InvalidProjectError = require('../errors').InvalidProjectError;

module.exports = function(packageName, projectPath) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}

	var moduleName = resolvePackageModuleName(packageName);
	return path.resolve(projectPath, 'node_modules', moduleName);
};
