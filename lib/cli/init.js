'use strict';

var path = require('path');
var Promise = require('promise');
var initPackageJson = require('init-package-json');

var loadNpmConfig = require('../helpers/loadNpmConfig');

var api = require('../api');

module.exports = function(args, options, callback) {
	options = options || {};
	var projectPath = options.path || process.cwd();
	return init(projectPath)
		.nodeify(callback);
};

function init(projectPath) {
	return ensureNpmModuleExists(projectPath)
		.then(function(pkg) {
			return api.initProject({
				path: projectPath
			});
		});


	function ensureNpmModuleExists(projectPath) {
		return checkWhetherNpmModuleExists(projectPath)
			.then(function(npmModuleExists) {
				if (npmModuleExists) {
					return loadNpmConfig(projectPath);
				} else {
					api.emit(api.events.INIT_PROJECT_NPM_INIT_NEEDED, {
						path: projectPath
					});
					return initNpmModule(projectPath);
				}
			});


		function checkWhetherNpmModuleExists(projectPath) {
			try {
				loadNpmConfig(projectPath);
			} catch (error) {
				return Promise.resolve(false);
			}
			return Promise.resolve(true);
		}

		function initNpmModule(projectPath) {
			return new Promise(function(resolve, reject) {
				var initFile = path.resolve(process.env.HOME, '.npm-init');
				var config = {};
				initPackageJson(projectPath, initFile, config, function(error, pkg) {
					if (error) { return reject(error); }
					return resolve(pkg);
				});
			});
		}
	}
}
