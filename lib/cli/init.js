'use strict';

var path = require('path');
var Promise = require('promise');
var initPackageJson = require('init-package-json');

var loadNpmConfig = require('../helpers/loadNpmConfig');
var npmCommands = require('../helpers/npmCommands');

var api = require('../api');

var NPM_MODULE_NAME = api.constants.NPM_MODULE_NAME;

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
		return ensureProjectModuleExists(projectPath)
			.then(function(pkg) {
				var apiModuleName = NPM_MODULE_NAME;
				return ensureApiModuleExists(projectPath, apiModuleName)
					.then(function(api) {
						return pkg;
					});
			});

		function ensureProjectModuleExists(projectPath) {
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

		function ensureApiModuleExists(projectPath, moduleName) {
			return getApiModuleIfExists(projectPath, moduleName)
				.then(function(apiModule) {
					if (apiModule) { return apiModule; }
					api.emit(api.events.INIT_PROJECT_API_INSTALL_NEEDED, {
						path: projectPath
					});
					return installApiModule(projectPath, moduleName)
						.then(function() {
							return getApiModuleIfExists(projectPath, moduleName);
						});
				});


			function getApiModuleIfExists(projectPath, moduleName) {
				var modulePath = path.resolve(projectPath, 'node_nodules', moduleName);
				var module;
				try {
					module = require(modulePath);
				} catch (error) {
					return Promise.resolve(null);
				}
				return Promise.resolve(module);
			}

			function installApiModule(projectPath, moduleName) {
				var packages = [moduleName];
				var options = {
					saveDev: true
				};
				return npmCommands.install(packages, options, projectPath);
			}
		}
	}
}
