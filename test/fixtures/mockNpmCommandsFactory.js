'use strict';

var sinon = require('sinon');
var Promise = require('promise');

module.exports = function() {
	return {
		install: sinon.spy(function(packages, options, projectPath, callback) {
			return Promise.resolve('1.2.3').nodeify(callback);
		}),
		uninstall: sinon.spy(function(packages, options, projectPath, callback) {
			return Promise.resolve().nodeify(callback);
		}),
		update: sinon.spy(function(packages, options, projectPath, callback) {
			return Promise.resolve('1.2.4').nodeify(callback);
		}),
		reset: function() {
			this.install.reset();
			this.uninstall.reset();
			this.update.reset();
		}
	};
};
