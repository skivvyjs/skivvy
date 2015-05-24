'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var events = require('../../../lib/events');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidNpmModuleError = require('../../../lib/errors').InvalidNpmModuleError;

chai.use(chaiAsPromised);

describe('api.initProject()', function() {
	var initProject;
	var MockApi;
	before(function() {
		MockApi = mockApiFactory();
		initProject = require('../../../lib/api/initProject');
		initProject = initProject.bind(MockApi);
	});

	var unmockFiles = null;

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		MockApi.reset();
	});

	it('should throw an error if package.json is not present', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'/project': {}
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidNpmModuleError;
		actual = initProject({
			path: '/project'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should throw an error if an invalid config file exists', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': ''
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = initProject({
			path: '/project'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should create a default config file and tasks folder if none exists', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var defaultConfigFile = {
			environment: {
				default: {}
			},
			packages: {}
		};

		var expected, actual;
		return initProject({
			path: '/project'
		})
			.then(function() {
				expected = defaultConfigFile;
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);

				expected = true;
				actual = fs.statSync('/project/skivvy_tasks').isDirectory();
				expect(actual).to.eql(expected);
			});
	});

	it('should not overwrite existing tasks if no valid config file exists', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy_tasks/hello.js': 'module.exports = function(config) { }; module.exports.description = \'Hello World task\';'
		};
		unmockFiles = mockFiles(files);

		var defaultConfigFile = {
			environment: {
				default: {}
			},
			packages: {}
		};

		var expected, actual;
		return initProject({
			path: '/project'
		})
			.then(function() {
				expected = defaultConfigFile;
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);

				expected = true;
				actual = fs.statSync('/project/skivvy_tasks/hello.js').isFile();
				expect(actual).to.eql(expected);
			});
	});

	it('should add a tasks folder but not make config changes if a valid config file exists', function() {
		var pkg = {
			name: 'hello-world'
		};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!'
				}
			},
			packages: {
				'hello': {
					message: 'Hello, world!'
				},
				'goodbye': {
					message: 'Hello, world!'
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return initProject({
			path: '/project'
		})
			.then(function() {
				expected = config;
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);

				expected = true;
				actual = fs.statSync('/project/skivvy_tasks').isDirectory();
				expect(actual).to.eql(expected);
			});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var defaultConfigFile = {
			environment: {
				default: {}
			},
			packages: {}
		};

		var expected, actual;
		return initProject()
			.then(function() {
				expected = defaultConfigFile;
				actual = JSON.parse(fs.readFileSync('.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);

				expected = true;
				actual = fs.statSync('skivvy_tasks').isDirectory();
				expect(actual).to.eql(expected);
			});
	});

	it('should have tests for events', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.INIT_PROJECT_STARTED,
				path: '/project'
			},
			{
				event: events.INIT_PROJECT_COMPLETED,
				path: '/project'
			}
		];
		actual = [];

		MockApi.on(events.INIT_PROJECT_STARTED, onStarted);
		MockApi.on(events.INIT_PROJECT_COMPLETED, onCompleted);
		MockApi.on(events.INIT_PROJECT_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.INIT_PROJECT_STARTED,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.INIT_PROJECT_COMPLETED,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.INIT_PROJECT_FAILED,
				error: data.error,
				path: data.path
			});
		}

		return initProject({
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			});
	});
});
