'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');
var sharedTests = require('../sharedTests');

var api = require('../../../lib/api');
var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;
var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;

var updatePackageConfig = require('../../../lib/api/updatePackageConfig');

chai.use(chaiAsPromised);

sharedTests.addAsyncProjectTests(updatePackageConfig, 'api.updatePackageConfig()');

describe('api.updatePackageConfig()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no package name was specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			updatePackageConfig({ path: '/project' }),
			updatePackageConfig({ package: undefined, path: '/project' }),
			updatePackageConfig({ package: null, path: '/project' }),
			updatePackageConfig({ package: false, path: '/project' }),
			updatePackageConfig({ package: '', path: '/project' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if the specified package does not exist', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = updatePackageConfig({
			package: 'hello',
			path: '/project',
			updates: {}
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should throw an error if no config object was specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidConfigError;
		actual = [
			updatePackageConfig({ package: 'hello', path: '/project' }),
			updatePackageConfig({ package: 'hello', updates: undefined, path: '/project' }),
			updatePackageConfig({ package: 'hello', updates: null, path: '/project' }),
			updatePackageConfig({ package: 'hello', updates: false, path: '/project' }),
			updatePackageConfig({ package: 'hello', updates: '', path: '/project' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should create the package config if it does not exist', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'goodbye': {
					config: {
						message: 'Goodbye, world!'
					}
				}
			}
		};
		var updates = {
			message: 'Hello, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			environment: {
				default: {}
			},
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
			package: 'hello',
			updates: updates,
			path: '/project'
		})
			.then(function(updatedConfig) {
				return JSON.parse(fs.readFileSync('/project/skivvy.json', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should update the package config if it already exists', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!',
						user: 'world'
					}
				},
				'goodbye': {
					config: {
						message: 'Goodbye, world!'
					}
				}
			}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						message: 'Goodbye, world!',
						user: 'world'
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
			package: 'hello',
			updates: updates,
			path: '/project'
		})
			.then(function(updatedConfig) {
				return JSON.parse(fs.readFileSync('/project/skivvy.json', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return the updated package config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var updates = {
			message: 'Hello, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Hello, world!'
		};
		actual = updatePackageConfig({ package: 'hello', updates: updates, path: '/project' });
		return expect(actual).to.eventually.eql(expected);
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var updates = {
			message: 'Hello, world!'
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'skivvy.json': JSON.stringify(config),
			'node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Hello, world!'
		};
		actual = [
			updatePackageConfig({ package: 'hello', updates: updates }),
			updatePackageConfig({ package: 'hello', updates: updates, path: undefined }),
			updatePackageConfig({ package: 'hello', updates: updates, path: null }),
			updatePackageConfig({ package: 'hello', updates: updates, path: false }),
			updatePackageConfig({ package: 'hello', updates: updates, path: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.eventually.eql(expected);
		}));
	});

	it('should dispatch task start and end events', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						message: 'Hello, world!',
						user: 'world'
					}
				},
				'goodbye': {
					config: {
						message: 'Goodbye, world!'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};'
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

		api.on(events.UPDATE_PACKAGE_CONFIG_STARTED, onStarted);
		api.on(events.UPDATE_PACKAGE_CONFIG_COMPLETED, onCompleted);
		api.on(events.UPDATE_PACKAGE_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_PACKAGE_CONFIG_STARTED,
				package: data.package,
				updates: data.updates,
				path: data.path,
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
			},
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UPDATE_PACKAGE_CONFIG_STARTED, onStarted);
				api.removeListener(events.UPDATE_PACKAGE_CONFIG_COMPLETED, onCompleted);
				api.removeListener(events.UPDATE_PACKAGE_CONFIG_FAILED, onFailed);
			});
	});
});
