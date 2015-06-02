'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

chai.use(sinonChai);

describe('api.getPackageConfig()', function() {
	var getPackageConfig;
	var MockApi;
	var mockApi;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		getPackageConfig = require('../../../lib/api/getPackageConfig');
		getPackageConfig = getPackageConfig.bind(mockApi);
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

	it('should throw an error if no package name was specified', function() {
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
		expected = InvalidPackageError;
		actual = [
			function() { return getPackageConfig({ }); },
			function() { return getPackageConfig({ package: undefined }); },
			function() { return getPackageConfig({ package: null }); },
			function() { return getPackageConfig({ package: false }); },
			function() { return getPackageConfig({ package: '' }); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should return the package config', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello': {
					config: {
						user: 'world'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getPackageConfig({
			package: 'hello'
		});
		expect(actual).to.eql(expected);
	});

	it('should return an empty object if package config is undefined', function() {
		var pkg = {};
		var config = {
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {};
		actual = getPackageConfig({
			package: 'hello'
		});
		expect(actual).to.eql(expected);
	});

	it('should return a copy of default package config if config contains no package config', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { user: \'world\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getPackageConfig({
			package: 'hello'
		});
		expect(actual).to.eql(expected);

		expected = require('/project/node_modules/@skivvy/skivvy-package-hello').defaults;
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(expected);
	});

	it('should return an empty object if config contains no package config and no default package config exists', function() {
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {};
		actual = getPackageConfig({
			package: 'hello'
		});
		expect(actual).to.eql(expected);
	});

	it('should extend default package config with package config', function() {
		var pkg = {};
		var config = {
			packages: {
				'hello': {
					config: {
						greeting: 'Goodbye'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { user: \'world\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			greeting: 'Goodbye',
			user: 'world'
		};
		actual = getPackageConfig({
			package: 'hello'
		});
		expect(actual).to.eql(expected);
	});

	it('should skip expanding placeholders in config', function() {
		var pkg = {
			version: '1.0.1'
		};
		var config = {
			packages: {
				'hello': {
					config: {
						welcome: 'Welcome, <%= environment.user %>!'
					}
				}
			}
		};
		mockApi.stubs.environmentConfig = {
			user: 'A User <user@example.com>'
		};

		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { \'version\': \'v<%= project.version %>\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			welcome: 'Welcome, <%= environment.user %>!',
			version: 'v<%= project.version %>'
		};
		actual = [
			getPackageConfig({ package: 'hello' }),
			getPackageConfig({ package: 'hello', expand: undefined }),
			getPackageConfig({ package: 'hello', expand: null }),
			getPackageConfig({ package: 'hello', expand: false }),
			getPackageConfig({ package: 'hello', expand: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});

	it('should expand placeholders in config', function() {
		var pkg = {
			version: '1.0.1'
		};
		var config = {
			packages: {
				'hello': {
					config: {
						welcome: 'Welcome, <%= environment.user %>!'
					}
				}
			}
		};
		mockApi.stubs.environmentConfig = {
			user: 'A User <user@example.com>'
		};

		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { \'version\': \'v<%= project.version %>\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			welcome: 'Welcome, A User <user@example.com>!',
			version: 'v1.0.1'
		};
		actual = getPackageConfig({
			package: 'hello',
			expand: true
		});
		expect(actual).to.eql(expected);

		expect(mockApi.getEnvironmentConfig).to.have.been.calledWith({
			expand: true
		});
	});
});
