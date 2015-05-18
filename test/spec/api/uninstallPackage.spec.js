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
var uninstallPackage = rewire('../../../lib/api/uninstallPackage');

chai.use(chaiAsPromised);
chai.use(sinonChai);

sharedTests.addAsyncProjectTests(uninstallPackage, 'api.uninstallPackage()');

describe('api.uninstallPackage()', function() {
	var npmCommands = mockNpmCommandsFactory();
	var resetNpmCommands;
	var unmockFiles;

	before(function() {
		resetNpmCommands = uninstallPackage.__set__('npmCommands', npmCommands);
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
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			uninstallPackage({ path: '/project' }),
			uninstallPackage({ path: '/project', package: undefined }),
			uninstallPackage({ path: '/project', package: null }),
			uninstallPackage({ path: '/project', package: false }),
			uninstallPackage({ path: '/project', package: '' })
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
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = uninstallPackage({ path: '/project', package: 'hello-world' });
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should run npm uninstall [package] in the specified directory', function() {
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
			'/project/.skivvyrc': JSON.stringify(config),
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
		return uninstallPackage(options)
			.then(function(returnValue) {
				expected = undefined;
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.uninstall).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/project');
			});
	});

	it('should remove the package namespace from the config file', function() {
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
			'/project/.skivvyrc': JSON.stringify(config),
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
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					packages: {
						'@my-packages/hello-world': {
							message: 'Hello, world!'
						}
					},
				};
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
			'/project/.skivvyrc': JSON.stringify(config),
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
		return uninstallPackage(options)
			.then(function(returnValue) {
				expected = undefined;
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.uninstall).to.have.been.calledWith('@my-packages/skivvy-package-hello-world', npmOptions, '/project');

				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					packages: {
						'goodbye-world': {
							message: 'Goodbye, world!'
						}
					},
				};
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if the namespace does not exist', function() {
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
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
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
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = config;
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if no namespaces exist', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
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
		return uninstallPackage(options)
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
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
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "@my-packages/skivvy-package-hello-world", "version": "1.2.3" }',
			'node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
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
				expect(npmCommands.uninstall).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/');

				actual = JSON.parse(fs.readFileSync('.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					packages: {
						'@my-packages/hello-world': {
							message: 'Hello, world!'
						}
					},
				};
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
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/skivvy-package-goodbye-world/package.json': '{ "name": "skivvy-package-goodbye-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-goodbye-world/index.js': 'exports.tasks = {}; exports.description = \'Goodbye World package\';'
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

		api.on(events.UNINSTALL_PACKAGE_STARTED, onStarted);
		api.on(events.UNINSTALL_PACKAGE_COMPLETED, onCompleted);
		api.on(events.UNINSTALL_PACKAGE_FAILED, onFailed);


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
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UNINSTALL_PACKAGE_STARTED, onStarted);
				api.removeListener(events.UNINSTALL_PACKAGE_COMPLETED, onCompleted);
				api.removeListener(events.UNINSTALL_PACKAGE_FAILED, onFailed);
			});
	});
});
