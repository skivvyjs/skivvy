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
		mockApi = new MockApi('/project', 'production');
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

	it('should return the environment config', function() {
		var pkg = {};
		var config = {
			environment: {
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

		var result = getEnvironmentConfig();
		expect(result).to.eql(config.environment.production);
	});

	it('should resolve named environment config', function() {
		var pkg = {};
		var config = {
			environment: {
				production: 'hello',
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

		var result = getEnvironmentConfig();
		expect(result).to.eql({
			user: 'world'
		});
	});

	it('should expand placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>'
		};
		var config = {
			environment: {
				production: {
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

		var result = getEnvironmentConfig({
			expand: true
		});
		expect(result).to.eql({
			message: 'Hello, A User <user@example.com>!'
		});
	});

	it('should skip expanding placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>'
		};
		var config = {
			environment: {
				production: {
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

		var results = [
			getEnvironmentConfig({ }),
			getEnvironmentConfig({ expand: undefined }),
			getEnvironmentConfig({ expand: null }),
			getEnvironmentConfig({ expand: false }),
			getEnvironmentConfig({ expand: '' })
		];
		results.forEach(function(result) {
			expect(result).to.eql({
				message: 'Hello, <%= project.author %>!'
			});
		});
	});
});
