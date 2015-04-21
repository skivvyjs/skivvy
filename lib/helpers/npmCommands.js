'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('promise');
var npm = require('npm');

exports.install = function(packages, options, projectPath, callback) {
	var isSinglePackage = typeof packages === 'string';
	if (isSinglePackage) { packages = [packages]; }
	return loadNpm(projectPath, options)
		.then(function(npm) {
			return new Promise(function(resolve, reject) {
				npm.commands.install(packages, function(error, packagesMetadata) {
					if (error) { return reject(error); }
					var packageVersions = getInstalledPackageVersions(packages, packagesMetadata);
					if (packages && options.savePeer) {
						return Promise.all(packages.map(function(packageName, index) {
							var packageVersion = packageVersions[index];
							return addPeerDependency(packageName, packageVersion, projectPath);
						})).then(function() {
							return resolve(packageVersions);
						});
					} else {
						return resolve(packageVersions);
					}
				});
			});
		})
		.then(function(packageVersions) {
			if (isSinglePackage) {
				return packageVersions[0];
			} else {
				return packageVersions;
			}
		})
		.nodeify(callback);


	function getInstalledPackageVersions(packageNames, packagesMetadata) {
		packagesMetadata = packagesMetadata || [];
		var rootPackagesMetadata = packagesMetadata.map(function(packageMetadata) {
			var versionedName = packageMetadata[0];
			var packageName = getUnversionedPackageName(versionedName);
			var version = versionedName.split('@').pop();
			return {
				name: packageName,
				version: version,
				path: packageMetadata[1],
				parentName: packageMetadata[2],
				parentPath: packageMetadata[3],
				versionQuery: packageMetadata[4]
			};
		}).filter(function(packageMetadata) {
			var isChildPackage = Boolean(packageMetadata.parentPath);
			return !isChildPackage;
		});

		return packageNames.map(function(packageName) {
			packageName = getUnversionedPackageName(packageName);
			var matchingPackage = rootPackagesMetadata.filter(function(packageMetadata) {
				return packageMetadata.name === packageName;
			})[0] || null;
			return matchingPackage ? matchingPackage.version : null;
		});
	}
};

exports.update = function(packages, options, projectPath, callback) {
	var isSinglePackage = typeof packages === 'string';
	if (isSinglePackage) { packages = [packages]; }
	return loadNpm(projectPath, options)
		.then(function(npm) {
			if (!packages) { throw new Error('No NPM packages specified'); }
			return new Promise(function(resolve, reject) {
				npm.commands.update(packages, function(error) {
					if (error) { return reject(error); }
					var packageVersions = getUpdatedPackageVersions(packages, projectPath);
					if (options.savePeer) {
						return Promise.all(packages.map(function(packageName) {
							return removePeerDependency(packageName, projectPath);
						})).then(function() {
							return resolve(packageVersions);
						});
					} else {
						return resolve(packageVersions);
					}
				});
			});
		})
		.then(function(packageVersions) {
			if (isSinglePackage) {
				return packageVersions[0];
			} else {
				return packageVersions;
			}
		})
		.nodeify(callback);


	function getUpdatedPackageVersions(packages, projectPath) {
		return packages.map(function(packageName) {
			packageName = getUnversionedPackageName(packageName);
			var packageJsonPath = path.resolve(projectPath, 'node_modules', packageName, 'package.json');
			try {
				var pkg = require(packageJsonPath);
				return pkg.version;
			} catch (error) {
				return null;
			}
		});
	}
};

exports.uninstall = function(packages, options, projectPath, callback) {
	var isSinglePackage = typeof packages === 'string';
	if (isSinglePackage) { packages = [packages]; }
	return loadNpm(projectPath, options)
		.then(function(npm) {
			if (!packages) { throw new Error('No NPM packages specified'); }
			return new Promise(function(resolve, reject) {
				npm.commands.uninstall(packages, function(error) {
					if (error) { return reject(error); }
					if (options.savePeer) {
						return Promise.all(packages.map(function(packageName) {
							return removePeerDependency(packageName, projectPath);
						})).then(function() {
							return resolve();
						});
					} else {
						return resolve();
					}
				});
			});
		})
		.nodeify(callback);
};


function addPeerDependency(packageName, packageVersion, projectPath) {
	return loadPackageConfig(projectPath)
		.then(function(pkg) {
			if (!pkg.hasOwnProperty('peerDependencies')) {
				pkg.peerDependencies = {};
			}
			var peerDependencies = pkg.peerDependencies;
			peerDependencies[packageName] = packageVersion;
			return savePackageConfig(projectPath, pkg);
		});
}

function removePeerDependency(packageName, projectPath) {
	return loadPackageConfig(projectPath)
		.then(function(pkg) {
			if (!pkg.hasOwnProperty('peerDependencies')) {
				return pkg;
			}
			var peerDependencies = pkg.peerDependencies;
			delete peerDependencies[packageName];
			return savePackageConfig(projectPath, pkg);
		});
}

function loadPackageConfig(projectPath) {
	return new Promise(function(resolve, reject) {
		var pkgPath = path.resolve(projectPath, 'package.json');
		fs.readFile(pkgPath, function(error, data) {
			if (error) { return reject(error); }
			try {
				data = JSON.parse(data.toString('utf8'));
			} catch (parseError) {
				return reject(new Error('Unable to parse package.json'));
			}
			return resolve(data);
		});
	});
}

function savePackageConfig(projectPath, config) {
	return new Promise(function(resolve, reject) {
		var pkgPath = path.resolve(projectPath, 'package.json');
		var data = JSON.stringify(data, null, 2) + '\n';
		fs.writeFile(pkgPath, data, function(error) {
			if (error) { return reject(error); }
			return resolve(config);
		});
	});
}

function getUnversionedPackageName(packageName) {
	var versionRegExp = /@\d+\.\d+\.\d+$/;
	var nameIncludesVersion = versionRegExp.test(packageName);
	if (!nameIncludesVersion) { return packageName; }
	return packageName.substr(0, packageName.lastIndexOf('@'));
}

function loadNpm(projectPath, options) {
	return new Promise(function(resolve, reject) {
		var pkg = require(path.resolve(projectPath, 'package.json'));

		npm.load(pkg, function(error, npm) {
			if (error) { return reject(error); }
			if (options) {
				for (var key in options) {
					npm.config.set(key, options[key]);
				}
			}
			return resolve(npm);
		});
	});
}
