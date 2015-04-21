'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var fs = require('fs');
var Promise = require('promise');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');
var mockNpmCommandsFactory = require('../../fixtures/mockNpmCommandsFactory');

var api = require('../../../lib/api');
var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var sharedTests = require('../sharedTests');
var updatePackage = rewire('../../../lib/api/updatePackage');

chai.use(chaiAsPromised);
chai.use(sinonChai);

sharedTests.addAsyncProjectTests(updatePackage, 'api.updatePackage()');

describe('api.updatePackage()', function() {
	var npmCommands = mockNpmCommandsFactory();
	var resetNpmCommands;
	var unmockFiles;

	before(function() {
		resetNpmCommands = updatePackage.__set__('npmCommands', npmCommands);
	});

	after(function() {
		resetNpmCommands();
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no package is specified', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			updatePackage({ path: '/project' }),
			updatePackage({ path: '/project', package: undefined }),
			updatePackage({ path: '/project', package: null }),
			updatePackage({ path: '/project', package: false }),
			updatePackage({ path: '/project', package: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if the specified package does not exist', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = updatePackage({ path: '/project', package: 'hello-world' });
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should run npm update [package] in the specified directory', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'@my-packages/hello-world': {
					message: 'Hello, world!'
				},
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "@my-packages/skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world',
			path: '/project'
		};

		var expected, actual;
		return updatePackage(options)
			.then(function(returnValue) {
				expected = '1.2.4';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.update).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/skivvy.json', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should handle scoped packages correctly', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'@my-packages/hello-world': {
					message: 'Hello, world!'
				},
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "@my-packages/skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: '@my-packages/hello-world',
			path: '/project'
		};

		var expected, actual;
		return updatePackage(options)
			.then(function(returnValue) {
				expected = '1.2.4';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.update).to.have.been.calledWith('@my-packages/skivvy-package-hello-world', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/skivvy.json', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'@my-packages/hello-world': {
					message: 'Hello, world!'
				},
				'goodbye-world': {
					message: 'Goodbye, world!'
				}
			},
		};
		var files = {
			'/package.json': JSON.stringify(pkg),
			'/skivvy.json': JSON.stringify(config),
			'/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "@my-packages/skivvy-package-hello-world", "version": "1.2.3" }',
			'/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'goodbye-world'
		};

		var expected, actual;
		return updatePackage(options)
			.then(function(returnValue) {
				expected = '1.2.4';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.update).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/');

				actual = JSON.parse(fs.readFileSync('skivvy.json', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should have tests for events', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UPDATE_PACKAGE_STARTED,
				package: 'goodbye-world',
				path: '/project'
			},
			{
				event: events.UPDATE_PACKAGE_COMPLETED,
				version: '1.2.4',
				package: 'goodbye-world',
				path: '/project'
			}
		];
		actual = [];

		api.on(events.UPDATE_PACKAGE_STARTED, onStarted);
		api.on(events.UPDATE_PACKAGE_COMPLETED, onCompleted);
		api.on(events.UPDATE_PACKAGE_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_STARTED,
				package: data.package,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_COMPLETED,
				version: data.version,
				package: data.package,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_FAILED,
				error: data.error,
				package: data.package,
				path: data.path
			});
		}

		return updatePackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UPDATE_PACKAGE_STARTED, onStarted);
				api.removeListener(events.UPDATE_PACKAGE_COMPLETED, onCompleted);
				api.removeListener(events.UPDATE_PACKAGE_FAILED, onFailed);
			});
	});
});
