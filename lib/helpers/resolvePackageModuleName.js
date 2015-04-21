'use strict';

var InvalidPackageError = require('../errors').InvalidPackageError;

var MODULE_PREFIX = require('../constants').MODULE_PREFIX;

module.exports = function(packageName) {
	if (!packageName) {
		throw new InvalidPackageError(packageName);
	}

	var isScopedModule = packageName.charAt(0) === '@';
	if (isScopedModule) {
		return getScopedModuleName(packageName);
	} else {
		return getGlobalModuleName(packageName);
	}


	function getGlobalModuleName(packageName) {
		var moduleName = MODULE_PREFIX + packageName;
		return moduleName;
	}

	function getScopedModuleName(packageName) {
		var separator = '/';
		var separatorIndex = packageName.indexOf('/');
		var scopeName = packageName.substr(0, separatorIndex);
		var scopedPackageName = packageName.substr(separatorIndex + separator.length);
		var moduleName = MODULE_PREFIX + scopedPackageName;
		var modulePath = scopeName + separator + moduleName;
		return modulePath;
	}
};
