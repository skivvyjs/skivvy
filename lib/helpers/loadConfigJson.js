'use strict';

var fs = require('fs');
var path = require('path');

var configCache = require('./configCache');

var InvalidProjectError = require('../errors').InvalidProjectError;

var CONFIG_FILENAME = require('../constants').CONFIG_FILENAME;

module.exports = function(projectPath) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}
	var configPath = path.resolve(projectPath, CONFIG_FILENAME);

	if (configCache.has(configPath)) {
		return configCache.get(configPath);
	}

	var config;
	try {
		var json = fs.readFileSync(configPath, 'utf8');
		config = JSON.parse(json);
		configCache.set(configPath, config);
	} catch (error) {
		var projectError = new InvalidProjectError(projectPath);
		projectError.cause = error;
		throw projectError;
	}
	return config;
};
