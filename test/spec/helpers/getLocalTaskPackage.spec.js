'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;

var getLocalTaskPackage = require('../../../lib/helpers/getLocalTaskPackage');

chai.use(chaiAsPromised);

describe('helpers.getLocalTaskPackage()', function() {
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
			getLocalTaskPackage(),
			getLocalTaskPackage(undefined),
			getLocalTaskPackage(null),
			getLocalTaskPackage(false),
			getLocalTaskPackage('')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should retrieve local tasks', function() {
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
			'/project/my-tasks/unused.js': 'module.exports = function() { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';',
			'/project/skivvy_tasks/goodbye.js': 'module.exports = function() { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/skivvy_tasks/hello.js': 'module.exports = function() { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: null,
			tasks: {
				'goodbye': require('/project/skivvy_tasks/goodbye.js'),
				'hello': require('/project/skivvy_tasks/hello.js')
			}
		};
		actual = getLocalTaskPackage('/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should add a taskName property to local tasks', function() {
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
			'/project/skivvy_tasks/goodbye.js': 'module.exports = function() { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/skivvy_tasks/hello.js': 'module.exports = function() { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';'
		};
		unmockFiles = mockFiles(files);

		var expected = {
			name: null,
			tasks: {
				'goodbye': require('/project/skivvy_tasks/goodbye.js'),
				'hello': require('/project/skivvy_tasks/hello.js')
			}
		};

		return getLocalTaskPackage('/project')
			.then(function(actual) {
				expect(expected).to.eql(actual);
				var tasks = actual.tasks;
				var taskNames = Object.keys(tasks);
				taskNames.forEach(function(taskName) {
					var task = tasks[taskName];
					var expected, actual;
					expected = taskName;
					actual = task.displayName;
					expect(actual).to.equal(expected);
				});
			});
	});

	it('should retrieve local tasks in custom location', function() {
		var pkg = {};
		var config = {
			include: 'my-tasks',
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/my-tasks/goodbye.js': 'module.exports = function(config) { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/my-tasks/hello.js': 'module.exports = function(config) { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';',
			'/project/skivvy_tasks/unused.js': 'module.exports = function(config) { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: null,
			tasks: {
				'goodbye': require('/project/my-tasks/goodbye.js'),
				'hello': require('/project/my-tasks/hello.js')
			}
		};
		actual = getLocalTaskPackage('/project');
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return an empty package when no local tasks are installed', function() {
		var pkg = {};
		var config = {
			include: 'my-tasks',
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/skivvy_tasks/unused.js': 'module.exports = function() { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			name: null,
			tasks: {}
		};
		actual = getLocalTaskPackage('/project');
		return expect(actual).to.eventually.eql(expected);
	});
});
