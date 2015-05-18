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

var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;

var updateEnvironmentConfig = require('../../../lib/api/updateEnvironmentConfig');

chai.use(chaiAsPromised);

sharedTests.addAsyncProjectTests(updateEnvironmentConfig, 'api.updateEnvironmentConfig()');

describe('api.updateEnvironmentConfig()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no config object was specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!'
				}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidConfigError;
		actual = [
			updateEnvironmentConfig({ path: '/project' }),
			updateEnvironmentConfig({ path: '/project', updates: undefined }),
			updateEnvironmentConfig({ path: '/project', updates: null }),
			updateEnvironmentConfig({ path: '/project', updates: false })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should update the project config file', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			environment: {
				default: {
					message: 'Goodbye, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		actual = updateEnvironmentConfig({
			path: '/project',
			updates: updates
		})
			.then(function(environmentConfig) {
				return JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return the updated environment config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Goodbye, world!',
			user: 'world'
		};
		actual = updateEnvironmentConfig({
			path: '/project',
			updates: updates
		});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			environment: {
				default: {
					message: 'Goodbye, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		actual = [
			updateEnvironmentConfig({ updates: updates}),
			updateEnvironmentConfig({ path: undefined, updates: updates }),
			updateEnvironmentConfig({ path: null, updates: updates }),
			updateEnvironmentConfig({ path: '', updates: updates })
		].map(function(actual) {
			return actual.then(function(environmentConfig) {
				return JSON.parse(fs.readFileSync('.skivvyrc', 'utf8'));
			});
		});
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.eventually.eql(expected);
		}));
	});

	it('should dispatch task start and end events for default environment', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UPDATE_ENVIRONMENT_CONFIG_STARTED,
				updates: updates,
				environment: 'default',
				path: '/project'
			},
			{
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: {
					message: 'Goodbye, world!',
					user: 'world'
				},
				updates: updates,
				environment: 'default',
				path: '/project'
			}
		];
		actual = [];

		api.on(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
		api.on(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
		api.on(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_STARTED,
				updates: data.updates,
				environment: data.environment,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: data.config,
				updates: data.updates,
				environment: data.environment,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_FAILED,
				error: data.error,
				updates: data.updates,
				environment: data.environment,
				path: data.path
			});
		}

		return updateEnvironmentConfig({
			updates: updates,
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);
			});
	});

	it('should dispatch task start and end events for custom environment', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {},
				secondary: {
					message: 'Hello, world!',
					user: 'world'
				}
			},
			packages: {}
		};
		var updates = {
			message: 'Goodbye, world!'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.UPDATE_ENVIRONMENT_CONFIG_STARTED,
				updates: updates,
				environment: 'secondary',
				path: '/project'
			},
			{
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: {
					message: 'Goodbye, world!',
					user: 'world'
				},
				updates: updates,
				environment: 'secondary',
				path: '/project'
			}
		];
		actual = [];

		api.on(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
		api.on(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
		api.on(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_STARTED,
				environment: data.environment,
				updates: data.updates,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: data.config,
				environment: data.environment,
				updates: data.updates,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_FAILED,
				error: data.error,
				environment: data.environment,
				updates: data.updates,
				path: data.path
			});
		}

		return updateEnvironmentConfig({
			updates: updates,
			path: '/project',
			environment: 'secondary'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
				api.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);
			});
	});
});
