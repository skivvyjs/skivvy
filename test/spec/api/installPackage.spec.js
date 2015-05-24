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
var mockApiFactory = require('../../fixtures/mockApiFactory');

var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('api.installPackage()', function() {
	var installPackage;
	var MockApi;
	var mockApi;
	var mockNpmCommands;

	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		mockNpmCommands = mockNpmCommandsFactory();
		installPackage = rewire('../../../lib/api/installPackage');
		installPackage.__set__('npmCommands', mockNpmCommands);
		installPackage = installPackage.bind(mockApi);
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
			installPackage({ path: '/project' }),
			installPackage({ path: '/project', package: undefined }),
			installPackage({ path: '/project', package: null }),
			installPackage({ path: '/project', package: false }),
			installPackage({ path: '/project', package: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should run npm install [package] in the specified directory', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'package'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(mockNpmCommands.install).to.have.been.calledWith('@skivvy/skivvy-package-package', npmOptions, '/project');
			});
	});

	it('should add a package namespace to the config file if none exists', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'package'
		})
			.then(function(returnValue) {
				expected = {
					packages: {
						'package': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should add a packages section to the config file if none exists', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'package'
		})
			.then(function(returnValue) {
				expected = {
					packages: {
						'package': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if the package namespace already exists', function() {
		var pkg = {};
		var config = {
			packages: {
				'package': {
					config: {
						message: 'Hello, world!'
					},
					tasks: {}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'package'
		})
			.then(function(returnValue) {
				expected = config;
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should not conflict with existing modules', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello-world': {
					config: {
						message: 'Hello, world!'
					},
					tasks: {}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'package'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(mockNpmCommands.install).to.have.been.calledWith('@skivvy/skivvy-package-package', npmOptions, '/project');

				expected = {
					packages: {
						'hello-world': {
							config: {
								message: 'Hello, world!'
							},
							tasks: {}
						},
						'package': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should handle scoped packages correctly', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello-world': {
					config: {
						message: 'Hello, world!'
					},
					tasks: {}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: '@my-packages/package'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(mockNpmCommands.install).to.have.been.calledWith('@my-packages/skivvy-package-package', npmOptions, '/project');

				expected = {
					packages: {
						'hello-world': {
							config: {
								message: 'Hello, world!'
							},
							tasks: {}
						},
						'@my-packages/package': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should have tests for events', function() {
		var pkg = {};
		var config = {
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.INSTALL_PACKAGE_STARTED,
				package: 'package',
				path: '/project'
			},
			{
				event: events.INSTALL_PACKAGE_COMPLETED,
				version: '1.2.3',
				package: 'package',
				path: '/project'
			}
		];
		actual = [];

		mockApi.on(events.INSTALL_PACKAGE_STARTED, onStarted);
		mockApi.on(events.INSTALL_PACKAGE_COMPLETED, onCompleted);
		mockApi.on(events.INSTALL_PACKAGE_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_STARTED,
				package: data.package,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_COMPLETED,
				version: data.version,
				package: data.package,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_FAILED,
				error: data.error,
				package: data.package,
				path: data.path
			});
		}

		return installPackage({
			package: 'package',
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			});
	});
});
