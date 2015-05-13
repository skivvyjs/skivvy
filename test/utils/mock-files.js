'use strict';

var path = require('path');
var fs = require('fs');
var mockFs = require('mock-fs');
var errno = require('errno');

var isMockFsActive = false;

module.exports = function(files) {
	if (isMockFsActive) { throw new Error('Mock filesystem already active'); }
	var isActive = true;

	var originalPath = process.cwd();
	process.chdir('/');
	var restoreProcess = mockProcess();
	mockFs(files);
	isMockFsActive = true;

	return function restore() {
		if (!isActive) { return; }
		isActive = false;
		Object.keys(files).forEach(function(filename) {
			filename = path.resolve(filename);
			if (require.cache.hasOwnProperty(filename)) {
				delete require.cache[filename];
			}
		});
		mockFs.restore();
		restoreProcess();
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
};
