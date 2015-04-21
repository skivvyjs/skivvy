'use strict';

var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');
var Promise = require('promise');


function MockApi() {
	this.dispatcher = new EventEmitter();
}

MockApi.prototype.getEnvironmentConfig = function(options, callback) {
	return Promise.resolve(getStubEnvironmentConfig(options)).nodeify(callback);
};

MockApi.prototype.getPackageConfig = function(options, callback) {
	return Promise.resolve(getStubPackageConfig(options)).nodeify(callback);
};

MockApi.prototype.getTaskConfig = function(options, callback) {
	return Promise.resolve(getStubTaskConfig(options)).nodeify(callback);
};

MockApi.prototype.initProject = function(options, callback) {
	return Promise.resolve().nodeify(callback);
};

MockApi.prototype.installPackage = function(options, callback) {
	return Promise.resolve(getStubInstalledPackageVersion(options)).nodeify(callback);
};

MockApi.prototype.uninstallPackage = function(options, callback) {
	return Promise.resolve().nodeify(callback);
};

MockApi.prototype.updatePackage = function(options, callback) {
	return Promise.resolve(getStubUpdatedPackageVersion(options)).nodeify(callback);
};

MockApi.prototype.listPackages = function(options, callback) {
	return Promise.resolve(getStubPackages(options)).nodeify(callback);
};

MockApi.prototype.updateEnvironmentConfig = function(options, callback) {
	return Promise.resolve(getStubUpdatedEnvironmentConfig(options)).nodeify(callback);
};

MockApi.prototype.updatePackageConfig = function(options, callback) {
	return Promise.resolve(getStubUpdatedPackageConfig(options)).nodeify(callback);
};

MockApi.prototype.updateTaskConfig = function(options, callback) {
	return Promise.resolve(getStubUpdatedTaskConfig(options)).nodeify(callback);
};

MockApi.prototype.run = function(options, callback) {
	return Promise.resolve(getStubTestResult(options)).nodeify(callback);
};

MockApi.prototype.emit = function(event) {
	this.dispatcher.emit.apply(this.dispatcher, arguments);
};

MockApi.prototype.on = function(event, listener) {
	this.dispatcher.on.apply(this.dispatcher, arguments);
};

MockApi.prototype.once = function(event, listener) {
	this.dispatcher.once.apply(this.dispatcher, arguments);
};

MockApi.prototype.removeListener = function(event, listener) {
	this.dispatcher.removeListener.apply(this.dispatcher, arguments);
};

MockApi.prototype.events = require('../../lib/events');

MockApi.prototype.utils = require('../../lib/utils');

module.exports = function() {
	return spyOn(new MockApi());
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

	var stub = memberNames.reduce(
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

	subject.constructor.call(stub);

	return stub;
}


function getStubEnvironmentConfig(options) {
	return {
		message: 'Hello, world!'
	};
}

function getStubPackageConfig(options) {
	return {
		message: 'Hello, world!'
	};
}

function getStubTaskConfig(options) {
	return {
		message: 'Hello, world!'
	};
}

function getStubInstalledPackageVersion(options) {
	return '1.2.3';
}

function getStubUpdatedPackageVersion(options) {
	return '1.2.4';
}

function getStubPackages(options) {
	if (options.versions) {
		return [
			{
				name: null,
				description: null,
				version: null,
				tasks: {
					'hello': createMockTask('hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			},
			{
				name: 'my-package',
				description: 'External package',
				version: '1.2.3',
				tasks: {
					'hello': createMockTask('my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('my-package/goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			},
			{
				name: '@my-packages/my-package',
				description: 'Scoped package',
				version: '1.2.4',
				tasks: {
					'hello': createMockTask('@my-packages/my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('@my-packages/my-package/goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			}
		];
	} else {
		return [
			{
				name: null,
				description: null,
				tasks: {
					'hello': createMockTask('hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			},
			{
				name: 'my-package',
				description: 'External package',
				tasks: {
					'hello': createMockTask('my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('my-package/goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			},
			{
				name: '@my-packages/my-package',
				description: 'Scoped package',
				tasks: {
					'hello': createMockTask('@my-packages/my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('@my-packages/my-package/goodbye', 'Goodbye World task', true, 'goodbye'),
				}
			}
		];
	}


	function createMockTask(name, description, isAsync, testResult) {
		var task = (isAsync ?
			function(config, callback) {
				setTimeout(function() {
					callback(null, testResult);
				});
			}
			:
			function(config) {
				return testResult;
			}
		);
		task.displayName = name;
		task.description = description;
		return task;
	}
}

function getStubUpdatedEnvironmentConfig(options) {
	return {
		message: 'Goodbye, world!'
	};
}

function getStubUpdatedPackageConfig(options) {
	return {
		message: 'Goodbye, world!'
	};
}

function getStubUpdatedTaskConfig(options) {
	return {
		message: 'Goodbye, world!'
	};
}

function getStubTestResult(options) {
	return 'hello';
}
