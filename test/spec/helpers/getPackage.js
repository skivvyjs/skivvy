'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var getPackage = require('../../../lib/helpers/getPackage');

chai.use(chaiAsPromised);

describe('helpers.getPackage()', function() {
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
			'skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = [
			getPackage(),
			getPackage('hello'),
			getPackage('hello', undefined),
			getPackage('hello', null),
			getPackage('hello', false),
			getPackage('hello', '')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
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
			getPackage(undefined, '/project'),
			getPackage(null, '/project'),
			getPackage(false, '/project'),
			getPackage('', '/project')
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
		actual = [
			getPackage('hello', '/project'),
			getPackage('@scoped/hello', '/project')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should get the specified package from global npm packages', function() {
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
			'/project/node_modules/other/index.js': 'module.exports = \'Non-Skivvy package\';',
			'/project/node_modules/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: 'hello',
			tasks: {}
		};
		actual = getPackage('hello', '/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should get the specified package from scoped npm packages', function() {
		var expected, actual;
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
			'/project/node_modules/@my-packages/other/index.js': 'module.exports = \'Non-Skivvy package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		expected = {
			name: '@my-packages/hello',
			tasks: {}
		};
		actual = getPackage('@my-packages/hello', '/project');
		return expect(actual).to.eventually.eql(expected);
	});


	it('should return a hash of named tasks within the package object', function() {
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
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = { \'example1\': require(\'./tasks/example1\'), \'example2\': require(\'./tasks/example2\') };',
			'/project/node_modules/@my-packages/skivvy-package-hello/tasks/example1.js': 'module.exports = function(config) { }; module.exports.description = \'First external example task\';',
			'/project/node_modules/@my-packages/skivvy-package-hello/tasks/example2.js': 'module.exports = function(config) { }; module.exports.description = \'Second external example task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: '@my-packages/hello',
			tasks: {
				'example1': require('/project/node_modules/@my-packages/skivvy-package-hello/tasks/example1'),
				'example2': require('/project/node_modules/@my-packages/skivvy-package-hello/tasks/example2')
			}
		};
		return getPackage('@my-packages/hello', '/project')
			.then(function(packageModule) {
				actual = packageModule;
				expect(actual).to.eql(expected);
				var packageName = actual.name;
				var tasks = actual.tasks;
				var taskNames = Object.keys(tasks);
				taskNames.forEach(function(taskName) {
					var task = tasks[taskName];
					var expected, actual;
					expected = packageName + '::' + taskName;
					actual = task.displayName;
					expect(actual).to.equal(expected);
				});
			});
	});
});
