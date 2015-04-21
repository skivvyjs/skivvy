'use strict';

var sinon = require('sinon');
var Promise = require('promise');

function MockNpmCommands() {

}

MockNpmCommands.prototype.install = sinon.spy(function(packages, options, projectPath, callback) {
	return Promise.resolve('1.2.3').nodeify(callback);
});

MockNpmCommands.prototype.uninstall = sinon.spy(function(packages, options, projectPath, callback) {
	return Promise.resolve().nodeify(callback);
});

MockNpmCommands.prototype.update = sinon.spy(function(packages, options, projectPath, callback) {
	return Promise.resolve('1.2.4').nodeify(callback);
});

MockNpmCommands.prototype.reset = function() {
	var methodNames = Object.keys(MockNpmCommands.prototype)
		.filter(function(methodName) {
			return (typeof MockNpmCommands.prototype[methodName] === 'function');
		})
		.filter(function(methodName) {
			return methodName !== 'reset';
		});

	var self = this;
	methodNames.forEach(function(methodName) {
		var spy = self[methodName];
		spy.reset();
	});
};

module.exports = function() {
	return spyOn(new MockNpmCommands());
};


function spyOn(subject) {
	var memberNames = Object.keys(subject.constructor.prototype);

	var spies = memberNames.filter(function(methodName) {
			return typeof subject[methodName] === 'function';
		})
		.map(function(methodName) {
			var method = subject[methodName];
			var spy = sinon.spy(method);
			subject[methodName] = spy;
			return spy;
		});

	return memberNames.reduce(
		function(stub, memberName) {
			stub[memberName] = subject[memberName];
			return stub;
		},
		{
			reset: function() {
				spies.forEach(function(spy) {
					spy.reset();
				});
			}
		}
	);
}
