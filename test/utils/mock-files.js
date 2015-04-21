'use strict';

var path = require('path');
var mockFs = require('mock-fs');

var isMockFsActive = false;

module.exports = function(files) {
	if (isMockFsActive) { throw new Error('Mock filesystem already active'); }
	var isActive = true;
	var cwd = process.cwd();
	process.chdir('/');
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
		process.chdir(cwd);
		isMockFsActive = false;
	};
};
