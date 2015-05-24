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

describe('api.updatePackage()', function() {
	var MockApi;
	var mockApi;
	var mockNpmCommands;
	var updatePackage;

	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		mockNpmCommands = mockNpmCommandsFactory();
		updatePackage = rewire('../../../lib/api/updatePackage');
		updatePackage.__set__('npmCommands', mockNpmCommands);
		updatePackage = updatePackage.bind(mockApi);
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
			updatePackage({}),
			updatePackage({ package: undefined }),
			updatePackage({ package: null }),
			updatePackage({ package: false }),
			updatePackage({ package: '' })
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
		actual = updatePackage({
			package: 'nonexistent'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should run npm update [package] in the specified directory', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'package': {
					message: 'Hello, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
			'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: 'package'
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
				expect(mockNpmCommands.update).to.have.been.calledWith('@skivvy/skivvy-package-package', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should handle scoped packages correctly', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'@my-packages/package': {
					message: 'Hello, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-package/package.json': '{}',
			'/project/node_modules/@my-packages/skivvy-package-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);
		var options = {
			package: '@my-packages/package'
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
				expect(mockNpmCommands.update).to.have.been.calledWith('@my-packages/skivvy-package-package', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should have tests for events', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
			'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UPDATE_PACKAGE_STARTED,
				package: 'package',
				path: '/project'
			},
			{
				event: events.UPDATE_PACKAGE_COMPLETED,
				version: '1.2.4',
				package: 'package',
				path: '/project'
			}
		];
		actual = [];

		mockApi.on(events.UPDATE_PACKAGE_STARTED, onStarted);
		mockApi.on(events.UPDATE_PACKAGE_COMPLETED, onCompleted);
		mockApi.on(events.UPDATE_PACKAGE_FAILED, onFailed);


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
			package: 'package',
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			});
	});
});
