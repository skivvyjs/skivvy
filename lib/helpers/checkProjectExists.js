'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var loadConfigJson = require('./loadConfigJson');

var InvalidProjectError = require('../errors').InvalidProjectError;
var CONFIG_FILENAME = require('../constants').CONFIG_FILENAME;

module.exports = function(projectPath, callback) {
	return checkProjectExists(projectPath)
		.nodeify(callback);
};

function checkProjectExists(projectPath) {
	return new Promise(function(resolve, reject) {
		if (!projectPath) {
			throw new InvalidProjectError(projectPath);
		}
		var configPath = path.resolve(projectPath, CONFIG_FILENAME);
		fs.stat(configPath, function(error, stat) {
			var fileDoesNotExist = (error && error.code === 'ENOENT');
			if (fileDoesNotExist) {
				return resolve(false);
			}
			try {
				loadConfigJson(projectPath);
			} catch (error) {
				return reject(error);
			}
			return resolve(true);
		});
	});
}
