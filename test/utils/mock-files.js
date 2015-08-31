'use strict';

var mockFs = require('mock-fs');
var configCache = require('../../lib/helpers/configCache');

var isMockFsActive = false;

module.exports = function(files) {
	if (isMockFsActive) { throw new Error('Mock filesystem already active'); }
	var isActive = true;

	var originalPath = process.cwd();
	process.chdir('/');
	var restoreRequire = mockRequire();
	var restoreConfigCache = mockConfigCache();
	mockFs(files);
	isMockFsActive = true;

	return function restore() {
		if (!isActive) { return; }
		isActive = false;
		mockFs.restore();
		restoreRequire();
		restoreConfigCache();
		process.chdir(originalPath);
		isMockFsActive = false;
	};


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
