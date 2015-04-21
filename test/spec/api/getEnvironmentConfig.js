'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');
var sharedTests = require('../sharedTests');

var getEnvironmentConfig = require('../../../lib/api/getEnvironmentConfig');

sharedTests.addSyncProjectTests(getEnvironmentConfig, 'api.getEnvironmentConfig()');

describe('api.getEnvironmentConfig()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
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
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = config.environment.default;
		actual = getEnvironmentConfig({
			path: '/project'
		});
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
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = config.environment.production;
		actual = getEnvironmentConfig({
			path: '/project',
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
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getEnvironmentConfig({
			path: '/project'
		});
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
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Hello, A User <user@example.com>!'
		};
		actual = getEnvironmentConfig({
			path: '/project',
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
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'Hello, <%= project.author %>!'
		};
		actual = [
			getEnvironmentConfig({ path: '/project' }),
			getEnvironmentConfig({ path: '/project', expand: undefined }),
			getEnvironmentConfig({ path: '/project', expand: null }),
			getEnvironmentConfig({ path: '/project', expand: false }),
			getEnvironmentConfig({ path: '/project', expand: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'hello'
				}
			},
			packages: {}
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			message: 'hello'
		};
		actual = [
			getEnvironmentConfig(),
			getEnvironmentConfig({}),
			getEnvironmentConfig({ path: undefined }),
			getEnvironmentConfig({ path: null }),
			getEnvironmentConfig({ path: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});
});
