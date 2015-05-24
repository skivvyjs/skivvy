'use strict';

var Promise = require('promise');
var mapSeries = require('promise-map-series');

var Api = require('../api');

module.exports = function(args, options, callback) {
	var packageNames = args;
	var projectPath = options.path || process.cwd();
	return update(packageNames, projectPath)
		.nodeify(callback);
};


function update(packageNames, projectPath) {
	var api = new Api(projectPath);

	if (packageNames.length === 0) {
		return updateAllPackages(projectPath);
	} else {
		return updatePackages(packageNames, projectPath);
	}

	function updateAllPackages(projectPath) {
		return getInstalledPackageNames(projectPath)
			.then(function(packageNames) {
				return updatePackages(packageNames);
			});


		function getInstalledPackageNames(projectPath) {
			return api.listPackages({
				versions: false
			})
				.then(function(packages) {
					return packages
						.filter(function(packageModule) {
							var isLocalPackage = !packageModule.name;
							return !isLocalPackage;
						}).map(function(packageModule) {
							return packageModule.name;
						});
				});
		}
	}

	function updatePackages(packageNames) {
		return Promise.resolve(mapSeries(packageNames, function(packageName) {
			return api.updatePackage({
				package: packageName
			});
		}));
	}
}
