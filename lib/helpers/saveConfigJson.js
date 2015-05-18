'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var configCache = require('./configCache');

var InvalidConfigError = require('../errors').InvalidConfigError;
var InvalidProjectError = require('../errors').InvalidProjectError;

var CONFIG_FILENAME = require('../constants').CONFIG_FILENAME;

module.exports = function(projectPath, config, callback) {
	projectPath = projectPath || '';
	var configPath = path.resolve(projectPath, CONFIG_FILENAME);

	return new Promise(function(resolve, reject) {
		if (!projectPath) {
			throw new InvalidProjectError(projectPath);
		}
		if (!config || (typeof config !== 'object') || Array.isArray(config)) {
			throw new InvalidConfigError(config);
		}
		var data;
		try {
			data = JSON.stringify(config, null, 2) + '\n';
		} catch (error) {
			throw new InvalidConfigError(config);
		}
		fs.writeFile(configPath, data, { encoding: 'utf8' }, function(error) {
			if (error) { return reject(error); }
			var config = JSON.parse(data);
			configCache.set(configPath, config);
			return resolve(config);
		});
	}).nodeify(callback);
};
