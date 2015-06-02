'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var getPackage = require('../../../lib/helpers/getPackage');


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
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = [
			function() { return getPackage(); },
			function() { return getPackage('hello'); },
			function() { return getPackage('hello', undefined); },
			function() { return getPackage('hello', null); },
			function() { return getPackage('hello', false); },
			function() { return getPackage('hello', ''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
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
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			function() { getPackage(undefined, '/project'); },
			function() { getPackage(null, '/project'); },
			function() { getPackage(false, '/project'); },
			function() { getPackage('', '/project'); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
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
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			function() { getPackage('hello', '/project'); },
			function() { getPackage('@scoped/hello', '/project'); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
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
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/other/index.js': 'module.exports = \'Non-Skivvy package\';',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: 'hello',
			tasks: {},
			defaults: {}
		};
		actual = getPackage('hello', '/project');
		expect(actual).to.eql(expected);
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
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@my-packages/other/index.js': 'module.exports = \'Non-Skivvy package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages/skivvy-package-goodbye/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		expected = {
			name: '@my-packages/hello',
			tasks: {},
			defaults: {}
		};
		actual = getPackage('@my-packages/hello', '/project');
		expect(actual).to.eql(expected);
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
			'/project/.skivvyrc': JSON.stringify(config),
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
			},
			defaults: {}
		};
		actual = getPackage('@my-packages/hello', '/project');
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
