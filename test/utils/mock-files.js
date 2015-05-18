'use strict';

var path = require('path');
var fs = require('fs');
var mockFs = require('mock-fs');
var errno = require('errno');
var configCache = require('../../lib/helpers/configCache');

var isMockFsActive = false;

module.exports = function(files) {
	if (isMockFsActive) { throw new Error('Mock filesystem already active'); }
	var isActive = true;

	var originalPath = process.cwd();
	process.chdir('/');
	var restoreProcess = mockProcess();
	var restoreRequire = mockRequire();
	var restoreConfigCache = mockConfigCache();
	mockFs(files);
	isMockFsActive = true;

	return function restore() {
		if (!isActive) { return; }
		isActive = false;
		mockFs.restore();
		restoreProcess();
		restoreRequire();
		restoreConfigCache();
		process.chdir(originalPath);
		isMockFsActive = false;
	};


	function mockProcess() {
		var currentPath = process.cwd();
		var cwd = process.cwd;
		var chdir = process.chdir;

		process.cwd = function() {
			return currentPath;
		};

		process.chdir = function(directory) {
			var isValidPath = fs.statSync(directory).isDirectory();
			if (!isValidPath) {
				var errorType = errno.code.ENOTDIR;
				var message = errorType.code + ', ' + errorType.description;
				throw new errno.custom.FilesystemError(message, errorType);
			}
			currentPath = path.resolve(currentPath, directory);
		};

		return function restore() {
			process.cwd = cwd;
			process.chdir = chdir;
		};
	}

	function mockRequire() {
		var originalCache = {};
		Object.keys(require.cache).forEach(function(filename) {
			originalCache[filename] = require.cache[filename];
			delete require.cache[filename];
		});
		return function() {
			Object.keys(require.cache).forEach(function(filename) {
				delete require.cache[filename];
			});
			Object.keys(originalCache).forEach(function(filename) {
				require.cache[filename] = originalCache[filename];
			});
		};
	}

	function mockConfigCache() {
		configCache.clear();
		return function() {
			configCache.clear();
		};
	}
};
