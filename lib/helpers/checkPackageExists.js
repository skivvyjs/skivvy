'use strict';

var fs = require('fs');
var Promise = require('promise');

var resolvePackagePath = require('./resolvePackagePath');

var InvalidPackageError = require('../errors').InvalidPackageError;

module.exports = function(packageName, projectPath, callback) {
	return checkPackageExists(packageName, projectPath)
		.nodeify(callback);
};

function checkPackageExists(packageName, projectPath) {
	return new Promise(function(resolve, reject) {
		if (!packageName) {
			throw new InvalidPackageError(packageName);
		}
		var modulePath = resolvePackagePath(packageName, projectPath);
		fs.stat(modulePath, function(error, stat) {
			if (error && error.code === 'ENOENT') {
				return resolve(false);
			}
			if (error) { return reject(error); }
			var packageExists = stat.isDirectory();
			return resolve(packageExists);
		});
	});
}
