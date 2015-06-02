'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;

var TASK_NAME_PACKAGE_SEPARATOR = require('../../../lib/constants').TASK_NAME_PACKAGE_SEPARATOR;

var getPackages = require('../../../lib/helpers/getPackages');

chai.use(chaiAsPromised);

describe('helpers.getPackages()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = [
			getPackages(),
			getPackages(undefined),
			getPackages(null),
			getPackages(false),
			getPackages('')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should retrieve external npm packages without versions', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: 'goodbye',
				tasks: {},
				defaults: {}
			},
			{
				name: 'hello',
				tasks: {},
				defaults: {}
			}
		];
		actual = getPackages('/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve external npm packages with versions', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye/package.json': '{ "name": "skivvy-package-goodbye", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-hello/package.json': '{ "name": "skivvy-package-hello", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: 'goodbye',
				version: '1.2.3',
				tasks: {},
				defaults: {}
			},
			{
				name: 'hello',
				version: '1.2.3',
				tasks: {},
				defaults: {}
			}
		];
		var shouldIncludeVersions = true;
		actual = getPackages('/project', shouldIncludeVersions);
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve scoped npm packages', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: '@my-packages/goodbye',
				tasks: {},
				defaults: {}
			},
			{
				name: '@my-packages/hello',
				tasks: {},
				defaults: {}
			}
		];
		actual = getPackages('/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve scoped npm packages with versions', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages/skivvy-package-goodbye/package.json': '{ "name": "skivvy-package-goodbye", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages/skivvy-package-hello/package.json': '{ "name": "skivvy-package-hello", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: '@my-packages/goodbye',
				version: '1.2.3',
				tasks: {},
				defaults: {}
			},
			{
				name: '@my-packages/hello',
				version: '1.2.3',
				tasks: {},
				defaults: {}
			}
		];
		var shouldIncludeVersions = true;
		actual = getPackages('/project', shouldIncludeVersions);
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return an empty array when no packages are installed', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages2/other/index.js': 'module.exports = \'Unrelated package\';',
			'/project/node_modules/other/index.js': 'module.exports = \'Unrelated package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [];
		actual = getPackages('/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return a hash of named tasks within the package objects', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = { \'example1\': require(\'./tasks/example1\'), \'example2\': require(\'./tasks/example2\') };',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/tasks/example1.js': 'module.exports = function(config) { }; module.exports.description = \'First external example task\';',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/tasks/example2.js': 'module.exports = function(config) { }; module.exports.description = \'Second external example task\';',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = { \'example1\': require(\'./tasks/example1\'), \'example2\': require(\'./tasks/example2\') };',
			'/project/node_modules/@skivvy/skivvy-package-hello/tasks/example1.js': 'module.exports = function(config) { }; module.exports.description = \'First external example task\';',
			'/project/node_modules/@skivvy/skivvy-package-hello/tasks/example2.js': 'module.exports = function(config) { }; module.exports.description = \'Second external example task\';',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/index.js': 'exports.tasks = { \'example1\': require(\'./tasks/example1\'), \'example2\': require(\'./tasks/example2\') };',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/tasks/example1.js': 'module.exports = function(config) { }; module.exports.description = \'First external example task\';',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/tasks/example2.js': 'module.exports = function(config) { }; module.exports.description = \'Second external example task\';',
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = { \'example1\': require(\'./tasks/example1\'), \'example2\': require(\'./tasks/example2\') };',
			'/project/node_modules/@my-packages/skivvy-package-hello/tasks/example1.js': 'module.exports = function(config) { }; module.exports.description = \'First external example task\';',
			'/project/node_modules/@my-packages/skivvy-package-hello/tasks/example2.js': 'module.exports = function(config) { }; module.exports.description = \'Second external example task\';'
		};
		unmockFiles = mockFiles(files);

		var expected;
		expected = [
			{
				name: '@my-packages/goodbye',
				tasks: {
					'example1': require('/project/node_modules/@my-packages/skivvy-package-goodbye/tasks/example1'),
					'example2': require('/project/node_modules/@my-packages/skivvy-package-goodbye/tasks/example2')
				},
				defaults: {}
			},
			{
				name: '@my-packages/hello',
				tasks: {
					'example1': require('/project/node_modules/@my-packages/skivvy-package-hello/tasks/example1'),
					'example2': require('/project/node_modules/@my-packages/skivvy-package-hello/tasks/example2')
				},
				defaults: {}
			},
			{
				name: 'goodbye',
				tasks: {
					'example1': require('/project/node_modules/@skivvy/skivvy-package-goodbye/tasks/example1'),
					'example2': require('/project/node_modules/@skivvy/skivvy-package-goodbye/tasks/example2')
				},
				defaults: {}
			},
			{
				name: 'hello',
				tasks: {
					'example1': require('/project/node_modules/@skivvy/skivvy-package-hello/tasks/example1'),
					'example2': require('/project/node_modules/@skivvy/skivvy-package-hello/tasks/example2')
				},
				defaults: {}
			}
		];
		return getPackages('/project')
			.then(function(actual) {
				expect(actual).to.eql(expected);
				actual.forEach(function(packageModule) {
					var packageName = packageModule.name;
					var tasks = packageModule.tasks;
					var taskNames = Object.keys(tasks);
					taskNames.forEach(function(taskName) {
						var task = tasks[taskName];
						var expected, actual;
						expected = packageName + TASK_NAME_PACKAGE_SEPARATOR + taskName;
						actual = task.displayName;
						expect(actual).to.equal(expected);
					});
				});
			});
	});
});
