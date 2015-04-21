'use strict';

var sinon = require('sinon');

module.exports = function(completeCallback) {
	return sinon.spy(function initPackageJson(dir, initFile, configData, callback) {
		var pkg = getStubPackageJson();
		setTimeout(function() {
			if (completeCallback) { completeCallback(null, pkg); }
			callback(null, pkg);
		});
	});
};


function getStubPackageJson() {
	return {
		name: 'hello-world',
		version: '1.0.0'
	};
}
