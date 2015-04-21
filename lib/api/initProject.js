'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var checkProjectExists = require('../helpers/checkProjectExists');
var loadNpmConfig = require('../helpers/loadNpmConfig');
var loadConfigJson = require('../helpers/loadConfigJson');
var saveConfigJson = require('../helpers/saveConfigJson');

var api = require('../api');
var events = require('../events');

var DEFAULT_ENVIRONMENT_NAME = require('../constants').DEFAULT_ENVIRONMENT_NAME;
var LOCAL_TASKS_PATH = require('../constants').LOCAL_TASKS_PATH;


module.exports = function(options, callback) {
	options = options || {};
	var projectPath = options.path || process.cwd();

	api.emit(events.INIT_PROJECT_STARTED, {
		path: projectPath
	});
	return initProject(projectPath)
		.then(function() {
			api.emit(events.INIT_PROJECT_COMPLETED, {
				path: projectPath
			});
		})
		.catch(function(error) {
			api.emit(events.INIT_PROJECT_FAILED, {
				path: projectPath,
				error: error
			});
			throw error;
		})
		.nodeify(callback);
};

function initProject(projectPath) {
	try {
		loadNpmConfig(projectPath);
	} catch (error) {
		return Promise.reject(error);
	}

	return checkProjectExists(projectPath)
		.then(function(configExists) {
			if (configExists) {
				return createLocalTasksFolder(projectPath)
					.then(function() {
						return loadConfigJson(projectPath);
					});
			}
			var defaultConfig = getDefaultConfig();
			return saveConfigJson(projectPath, defaultConfig)
				.then(function(config) {
					return createLocalTasksFolder(projectPath)
						.then(function() {
							return config;
						});
				});
		});


	function getDefaultConfig() {
		var config = {
			environment: {},
			packages: {}
		};
		config.environment[DEFAULT_ENVIRONMENT_NAME] = {};
		return config;
	}

	function createLocalTasksFolder(projectPath) {
		return new Promise(function(resolve, reject) {
			var localIncludePath = path.resolve(projectPath, LOCAL_TASKS_PATH);
			fs.stat(localIncludePath, function(error, stat) {
				if (error && (error.code !== 'ENOENT')) {
					return reject(error);
				}
				if (stat && stat.isDirectory()) {
					return resolve();
				}

				fs.mkdir(localIncludePath, function(error) {
					if (error) { return reject(error); }
					return resolve();
				});
			});
		});
	}
}
