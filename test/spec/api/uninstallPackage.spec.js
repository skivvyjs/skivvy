'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var fs = require('fs');
var Promise = require('promise');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');
var mockNpmCommandsFactory = require('../../fixtures/mockNpmCommandsFactory');

var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;


chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('api.uninstallPackage()', function() {
	var uninstallPackage;
	var MockApi;
	var mockApi;
	var mockNpmCommands;

	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		mockNpmCommands = mockNpmCommandsFactory();
		uninstallPackage = rewire('../../../lib/api/uninstallPackage');
		uninstallPackage.__set__('npmCommands', mockNpmCommands);
		uninstallPackage = uninstallPackage.bind(mockApi);
	});

	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		MockApi.reset();
		mockApi.reset();
		mockNpmCommands.reset();
	});

	it('should throw an error if no package is specified', function() {
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
			uninstallPackage({}),
			uninstallPackage({ package: undefined }),
			uninstallPackage({ package: null }),
			uninstallPackage({ package: false }),
			uninstallPackage({ package: '' })
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
		actual = uninstallPackage({
			package: 'nonexistent'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should run npm uninstall [package] in the specified directory', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/package.json': '{}',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world'
		};

		var expected, actual;
		return uninstallPackage(options)
			.then(function(returnValue) {
				expected = undefined;
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(mockNpmCommands.uninstall).to.have.been.calledWith('@skivvy/skivvy-package-goodbye-world', npmOptions, '/project');
			});
	});

	it('should remove the package namespace from the config file', function() {
		var pkg = {};
		var config = {
			packages: {
				'@package/hello-world': {
					message: 'Hello, world!'
				},
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@package/skivvy-package-hello-world/package.json': '{}',
			'/project/node_modules/@package/skivvy-package-hello-world/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/package.json': '{}',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world'
		};

		var expected, actual;
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					packages: {
						'@package/hello-world': {
							message: 'Hello, world!'
						}
					}
				};
				expect(actual).to.eql(expected);
			});
	});

	it('should handle scoped packages correctly', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello-world': {
					message: 'Hello, world!'
				},
				'@package/goodbye-world': {
					message: 'Goodbye, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@package/skivvy-package-goodbye-world/package.json': '{}',
			'/project/node_modules/@package/skivvy-package-goodbye-world/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-hello-world/package.json': '{}',
			'/project/node_modules/@skivvy/skivvy-package-hello-world/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: '@package/goodbye-world'
		};

		var expected, actual;
		return uninstallPackage(options)
			.then(function(returnValue) {
				expected = undefined;
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(mockNpmCommands.uninstall).to.have.been.calledWith('@package/skivvy-package-goodbye-world', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					packages: {
						'hello-world': {
							message: 'Hello, world!'
						}
					}
				};
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if the namespace does not exist', function() {
		var pkg = {};
		var config = {
			packages: {
				'@my-packages/hello-world': {
					message: 'Hello, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "@my-packages/skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world'
		};

		var expected, actual;
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					packages: {
						'@my-packages/hello-world': {
							message: 'Hello, world!'
						}
					}
				};
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if no namespaces exist', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world'
		};

		var expected, actual;
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {};
				expect(actual).to.eql(expected);
			});
	});

	it('should have tests for events', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UNINSTALL_PACKAGE_STARTED,
				package: 'goodbye-world',
				path: '/project'
			},
			{
				event: events.UNINSTALL_PACKAGE_COMPLETED,
				package: 'goodbye-world',
				path: '/project'
			}
		];
		actual = [];

		mockApi.on(events.UNINSTALL_PACKAGE_STARTED, onStarted);
		mockApi.on(events.UNINSTALL_PACKAGE_COMPLETED, onCompleted);
		mockApi.on(events.UNINSTALL_PACKAGE_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UNINSTALL_PACKAGE_STARTED,
				package: data.package,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UNINSTALL_PACKAGE_COMPLETED,
				package: data.package,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UNINSTALL_PACKAGE_FAILED,
				error: data.error,
				package: data.package,
				path: data.path
			});
		}

		return uninstallPackage({
			package: 'goodbye-world'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			});
	});
});
