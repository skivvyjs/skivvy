'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var events = require('../../../lib/events');

var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;


chai.use(chaiAsPromised);

describe('api.updateEnvironmentConfig()', function() {
	var MockApi;
	var mockApi;
	var updateEnvironmentConfig;

	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project', 'production');
		updateEnvironmentConfig = require('../../../lib/api/updateEnvironmentConfig');
		updateEnvironmentConfig = updateEnvironmentConfig.bind(mockApi);
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

	it('should throw an error if no config object was specified', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidConfigError;
		actual = [
			updateEnvironmentConfig({}),
			updateEnvironmentConfig({ updates: undefined }),
			updateEnvironmentConfig({ updates: null }),
			updateEnvironmentConfig({ updates: false })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should update the project config file', function() {
		var pkg = {};
		var config = {
			environment: {
				production: {
					message: 'Hello, world!',
					user: 'world'
				}
			}
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
				production: {
					message: 'Goodbye, world!',
					user: 'world'
				}
			}
		};
		actual = updateEnvironmentConfig({
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
				production: {
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

	it('should dispatch task start and end events', function() {
		var pkg = {};
		var config = {
			environment: {
				production: {
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
				path: '/project',
				environment: 'production'
			},
			{
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: {
					message: 'Goodbye, world!',
					user: 'world'
				},
				updates: updates,
				path: '/project',
				environment: 'production'
			}
		];
		actual = [];

		mockApi.on(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
		mockApi.on(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
		mockApi.on(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_STARTED,
				updates: data.updates,
				path: data.path,
				environment: data.environment
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED,
				config: data.config,
				updates: data.updates,
				path: data.path,
				environment: data.environment
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.UPDATE_ENVIRONMENT_CONFIG_FAILED,
				error: data.error,
				updates: data.updates,
				path: data.path,
				environment: data.environment
			});
		}

		return updateEnvironmentConfig({
			updates: updates
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				mockApi.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_STARTED, onStarted);
				mockApi.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED, onCompleted);
				mockApi.removeListener(events.UPDATE_ENVIRONMENT_CONFIG_FAILED, onFailed);
			});
	});
});
