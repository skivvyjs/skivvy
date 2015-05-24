'use strict';

var emitterMixin = require('emitter-mixin');
var sinon = require('sinon');
var Promise = require('promise');
var skivvyUtils = require('skivvy-utils');

module.exports = function() {

	function MockApi(path) {
		this.path = path;

		this.events = MockApi.events;
		this.utils = MockApi.utils;

		this.getEnvironmentConfig = sinon.spy(function(options) {
			return (typeof this.stubs.environmentConfig === 'function' ? this.stubs.environmentConfig(options) : (this.stubs.environmentConfig || getStubEnvironmentConfig(options)));
		});
		this.getPackageConfig = sinon.spy(function(options) {
			return (typeof this.stubs.packageConfig === 'function' ? this.stubs.packageConfig(options) : (this.stubs.packageConfig || getStubPackageConfig(options)));
		});
		this.getTaskConfig = sinon.spy(function(options) {
			return (typeof this.stubs.taskConfig === 'function' ? this.stubs.taskConfig(options) : (this.stubs.taskConfig || getStubTaskConfig(options)));
		});
		this.installPackage = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubInstalledPackageVersion(options)).nodeify(callback);
		});
		this.uninstallPackage = sinon.spy(function(options, callback) {
			return Promise.resolve().nodeify(callback);
		});
		this.updatePackage = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubUpdatedPackageVersion(options)).nodeify(callback);
		});
		this.listPackages = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubPackages(options)).nodeify(callback);
		});
		this.updateEnvironmentConfig = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubUpdatedEnvironmentConfig(options)).nodeify(callback);
		});
		this.updatePackageConfig = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubUpdatedPackageConfig(options)).nodeify(callback);
		});
		this.updateTaskConfig = sinon.spy(function(options, callback) {
			return Promise.resolve(getStubUpdatedTaskConfig(options)).nodeify(callback);
		});
		this.run = sinon.spy(function(options, callback) {
			return Promise.resolve(this.stubs.run ? this.stubs.run(options, callback) : getStubTestResult(options)).nodeify(callback);
		});

		emitterMixin(this);
		this.addListener = sinon.spy(this.addListener);
		this.emit = sinon.spy(this.emit);
		this.listeners = sinon.spy(this.listeners);
		this.off = sinon.spy(this.off);
		this.on = sinon.spy(this.on);
		this.once = sinon.spy(this.once);
		this.removeAllListeners = sinon.spy(this.removeAllListeners);
		this.removeListener = sinon.spy(this.removeListener);
		this.setMaxListeners = sinon.spy(this.setMaxListeners);

		this.stubs = {
			environmentConfig: MockApi.stubs.environmentConfig || null,
			packageConfig: MockApi.stubs.packageConfig || null,
			taskConfig: MockApi.stubs.taskConfig || null,
			run: MockApi.stubs.run || null
		};

		this.reset = function() {
			this.getEnvironmentConfig.reset();
			this.getPackageConfig.reset();
			this.getTaskConfig.reset();
			this.installPackage.reset();
			this.uninstallPackage.reset();
			this.updatePackage.reset();
			this.listPackages.reset();
			this.updateEnvironmentConfig.reset();
			this.updatePackageConfig.reset();
			this.updateTaskConfig.reset();
			this.run.reset();

			this.addListener.reset();
			this.emit.reset();
			this.listeners.reset();
			this.off.reset();
			this.on.reset();
			this.once.reset();
			this.removeAllListeners.reset();
			this.removeListener.reset();
			this.setMaxListeners.reset();

			this.removeAllListeners();

			var stubs = this.stubs;
			Object.keys(stubs).forEach(function(key) {
				stubs[key] = null;
			});
		};

		MockApi.instance = this;
	}

	emitterMixin(MockApi);
	MockApi.addListener = sinon.spy(MockApi.addListener);
	MockApi.emit = sinon.spy(MockApi.emit);
	MockApi.listeners = sinon.spy(MockApi.listeners);
	MockApi.off = sinon.spy(MockApi.off);
	MockApi.on = sinon.spy(MockApi.on);
	MockApi.once = sinon.spy(MockApi.once);
	MockApi.removeAllListeners = sinon.spy(MockApi.removeAllListeners);
	MockApi.removeListener = sinon.spy(MockApi.removeListener);
	MockApi.setMaxListeners = sinon.spy(MockApi.setMaxListeners);

	MockApi.events = require('../../lib/events');
	MockApi.utils = skivvyUtils;

	MockApi.initProject = sinon.spy(function(options, callback) {
		return Promise.resolve(new MockApi()).nodeify(callback);
	});

	MockApi.stubs = {
		environmentConfig: null,
		packageConfig: null,
		taskConfig: null,
		run: null
	};

	MockApi.reset = function(keepListeners) {
		MockApi.initProject.reset();

		MockApi.addListener.reset();
		MockApi.emit.reset();
		MockApi.listeners.reset();
		MockApi.off.reset();
		MockApi.on.reset();
		MockApi.once.reset();
		MockApi.removeAllListeners.reset();
		MockApi.removeListener.reset();
		MockApi.setMaxListeners.reset();

		var stubs = this.stubs;
		Object.keys(stubs).forEach(function(key) {
			stubs[key] = null;
		});

		MockApi.instance = null;

		if (!keepListeners) {
			this.removeAllListeners();
		}
	};

	return MockApi;
};


function getStubEnvironmentConfig(options) {
	return {
		message: 'Stub: Hello, world!'
	};
}

function getStubPackageConfig(options) {
	return {
		message: 'Stub: Hello, world!'
	};
}

function getStubTaskConfig(options) {
	return {
		message: 'Stub: Hello, world!'
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
					'goodbye': createMockTask('goodbye', 'Goodbye World task', true, 'goodbye')
				}
			},
			{
				name: 'my-package',
				description: 'External package',
				version: '1.2.3',
				tasks: {
					'hello': createMockTask('my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('my-package/goodbye', 'Goodbye World task', true, 'goodbye')
				}
			},
			{
				name: '@my-packages/my-package',
				description: 'Scoped package',
				version: '1.2.4',
				tasks: {
					'hello': createMockTask('@my-packages/my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('@my-packages/my-package/goodbye', 'Goodbye World task', true, 'goodbye')
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
					'goodbye': createMockTask('goodbye', 'Goodbye World task', true, 'goodbye')
				}
			},
			{
				name: 'my-package',
				description: 'External package',
				tasks: {
					'hello': createMockTask('my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('my-package/goodbye', 'Goodbye World task', true, 'goodbye')
				}
			},
			{
				name: '@my-packages/my-package',
				description: 'Scoped package',
				tasks: {
					'hello': createMockTask('@my-packages/my-package/hello', 'Hello World task', false, 'hello'),
					'goodbye': createMockTask('@my-packages/my-package/goodbye', 'Goodbye World task', true, 'goodbye')
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
