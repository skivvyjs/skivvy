'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

describe('api.getEnvironmentConfig()', function() {
	var getEnvironmentConfig;
	var MockApi;
	var mockApi;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		getEnvironmentConfig = require('../../../lib/api/getEnvironmentConfig');
		getEnvironmentConfig = getEnvironmentConfig.bind(mockApi);
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

	it('should return the default environment config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					hello: 'hello',
					message: 'hello world',
					zero: 0,
					one: 1,
					two: 2,
					yes: true,
					no: false,
					array: [
						'hello',
						'hello world',
						0,
						1,
						2,
						true,
						false
					],
					nested: {
						hello: 'hello',
						message: 'hello world',
						zero: 0,
						one: 1,
						two: 2,
						yes: true,
						no: false,
						array: [
							'hello',
							'hello world',
							0,
							1,
							2,
							true,
							false
						]
					}
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
		expected = config.environment.default;
		actual = getEnvironmentConfig();
		return expect(actual).to.eql(expected);
	});

	it('should return a custom environment config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {},
				production: {
					hello: 'hello',
					message: 'hello world',
					zero: 0,
					one: 1,
					two: 2,
					yes: true,
					no: false,
					array: [
						'hello',
						'hello world',
						0,
						1,
						2,
						true,
						false
					],
					nested: {
						hello: 'hello',
						message: 'hello world',
						zero: 0,
						one: 1,
						two: 2,
						yes: true,
						no: false,
						array: [
							'hello',
							'hello world',
							0,
							1,
							2,
							true,
							false
						]
					}
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
		expected = config.environment.production;
		actual = getEnvironmentConfig({
			environment: 'production'
		});
		return expect(actual).to.eql(expected);
	});

	it('should resolve named default config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: 'hello',
				'hello': {
					user: 'world'
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
		expected = {
			user: 'world'
		};
		actual = getEnvironmentConfig();
		return expect(actual).to.eql(expected);
	});

	it('should expand placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>'
		};
		var config = {
			environment: {
				default: {
					message: 'Hello, <%= project.author %>!'
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
		expected = {
			message: 'Hello, A User <user@example.com>!'
		};
		actual = getEnvironmentConfig({
			expand: true
		});
		return expect(actual).to.eql(expected);
	});

	it('should skip expanding placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>'
		};
		var config = {
			environment: {
				default: {
					message: 'Hello, <%= project.author %>!'
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
		expected = {
			message: 'Hello, <%= project.author %>!'
		};
		actual = [
			getEnvironmentConfig({ }),
			getEnvironmentConfig({ expand: undefined }),
			getEnvironmentConfig({ expand: null }),
			getEnvironmentConfig({ expand: false }),
			getEnvironmentConfig({ expand: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});
});
