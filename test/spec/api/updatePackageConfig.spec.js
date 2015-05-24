'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;
var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;

chai.use(chaiAsPromised);

describe('api.updatePackageConfig()', function() {
	var MockApi;
	var mockApi;
	var updatePackageConfig;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		updatePackageConfig = require('../../../lib/api/updatePackageConfig');
		updatePackageConfig = updatePackageConfig.bind(mockApi);
	});

	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		MockApi.reset();
		mockApi.reset();
	});

	it('should throw an error if no package name was specified', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			updatePackageConfig({}),
			updatePackageConfig({ package: undefined }),
			updatePackageConfig({ package: null }),
			updatePackageConfig({ package: false }),
			updatePackageConfig({ package: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if the specified package does not exist', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = updatePackageConfig({
			package: 'nonexistent',
			updates: {}
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should throw an error if no config object was specified', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidConfigError;
		actual = [
			updatePackageConfig({ package: 'package' }),
			updatePackageConfig({ package: 'package', updates: undefined }),
			updatePackageConfig({ package: 'package', updates: null }),
			updatePackageConfig({ package: 'package', updates: false }),
			updatePackageConfig({ package: 'package', updates: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should create the package config if it does not exist', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!'
					}
				}
			}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!'
					}
				},
				'goodbye': {
					config: {
						message: 'Goodbye, world!'
					}
				}
			}
		};
		actual = updatePackageConfig({
			package: 'goodbye',
			updates: updates
		})
			.then(function(updatedConfig) {
				return JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should update the package config if it already exists', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!',
						user: 'world'
					}
				},
				'goodbye': {
					config: {
						message: 'Goodbye, world!',
						user: 'world'
					}
				}
			}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			packages: {
				'hello': {
					config: {
						message: 'Goodbye, world!',
						user: 'world'
					}
				},
				'goodbye': {
					config: {
						message: 'Goodbye, world!',
						user: 'world'
					}
				}
			}
		};
		actual = updatePackageConfig({
			package: 'hello',
			updates: updates
		})
			.then(function(updatedConfig) {
				return JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return the updated package config', function() {
		var pkg = {};
		var config = {};
		var updates = {
			message: 'Hello, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Hello, world!'
		};
		actual = updatePackageConfig({
			package: 'hello',
			updates: updates
		});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should dispatch task start and end events', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!',
						user: 'world'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UPDATE_PACKAGE_CONFIG_STARTED,
				updates: {
					message: 'Goodbye, world!'
				},
				package: 'hello',
				path: '/project'
			},
			{
				event: events.UPDATE_PACKAGE_CONFIG_COMPLETED,
				config: {
					message: 'Goodbye, world!',
					user: 'world'
				},
				updates: {
					message: 'Goodbye, world!'
				},
				package: 'hello',
				path: '/project'
			}
		];
		actual = [];

		mockApi.on(events.UPDATE_PACKAGE_CONFIG_STARTED, onStarted);
		mockApi.on(events.UPDATE_PACKAGE_CONFIG_COMPLETED, onCompleted);
		mockApi.on(events.UPDATE_PACKAGE_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_CONFIG_STARTED,
				package: data.package,
				updates: data.updates,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_CONFIG_COMPLETED,
				config: data.config,
				package: data.package,
				updates: data.updates,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_CONFIG_FAILED,
				error: data.error,
				package: data.package,
				updates: data.updates,
				path: data.path
			});
		}

		return updatePackageConfig({
			package: 'hello',
			updates: {
				message: 'Goodbye, world!'
			}
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			});
	});
});
