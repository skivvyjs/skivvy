'use strict';

var path = require('path');

var InvalidProjectError = require('../errors').InvalidProjectError;

var CONFIG_FILENAME = require('../constants').CONFIG_FILENAME;

module.exports = function(projectPath) {
	if (!projectPath) {
		throw new InvalidProjectError(projectPath);
	}
	var configPath = path.resolve(projectPath, CONFIG_FILENAME);
	var config;
	try {
		config = require(configPath);
	} catch (error) {
		throw new InvalidProjectError(projectPath);
	}
	return config;
};
