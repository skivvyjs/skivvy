'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');
var sharedTests = require('../sharedTests');

var listPackages = require('../../../lib/api/listPackages');

chai.use(chaiAsPromised);

sharedTests.addAsyncProjectTests(listPackages, 'api.listPackages()');

describe('api.listPackages()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should retrieve local task package', function() {
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
		expected = [
			{
				name: null,
				tasks: {
					'goodbye': require('/project/skivvy_tasks/goodbye.js'),
					'hello': require('/project/skivvy_tasks/hello.js')
				}
			}
		];
		actual = listPackages({ path: '/project' });
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve local task package in custom location', function() {
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
			'/project/my-tasks/goodbye.js': 'module.exports = function() { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/my-tasks/hello.js': 'module.exports = function() { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';',
			'/project/skivvy_tasks/unused.js': 'module.exports = function() { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: null,
				tasks: {
					'goodbye': require('/project/my-tasks/goodbye.js'),
					'hello': require('/project/my-tasks/hello.js')
				}
			}
		];
		actual = listPackages({ path: '/project' });
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve all installed packages and tasks', function() {
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
			'/project/my-tasks/goodbye.js': 'module.exports = function() { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/my-tasks/hello.js': 'module.exports = function() { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';',
			'/project/node_modules/@my-packages1/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages2/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages2/other/index.js': 'module.exports = \'Unrelated package\';',
			'/project/node_modules/other/index.js': 'module.exports = \'Unrelated package\';',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/skivvy_tasks/unused.js': 'module.exports = function() { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: null,
				tasks: {
					'goodbye': require('/project/my-tasks/goodbye.js'),
					'hello': require('/project/my-tasks/hello.js')
				}
			},
			{
				name: '@my-packages1/hello',
				tasks: {}
			},
			{
				name: '@my-packages2/goodbye',
				tasks: {}
			},
			{
				name: 'goodbye',
				tasks: {}
			},
			{
				name: 'hello',
				tasks: {}
			}
		];
		actual = listPackages({ path: '/project' });
		return expect(actual).to.eventually.eql(expected);
	});

	it('should retrieve version numbers if specified', function() {
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
			'/project/my-tasks/goodbye.js': 'module.exports = function() { console.log(\'Goodbye, world!\'); }; module.exports.description = \'Goodbye World task\';',
			'/project/my-tasks/hello.js': 'module.exports = function() { console.log(\'Hello, world!\'); }; module.exports.description = \'Hello World task\';',
			'/project/node_modules/@my-packages1/skivvy-package-hello/package.json': '{ "name": "@my-packages1/skivvy-package-hello", "version": "1.2.3" }',
			'/project/node_modules/@my-packages1/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages2/skivvy-package-goodbye/package.json': '{ "name": "@my-packages2/skivvy-package-goodbye", "version": "1.2.3" }',
			'/project/node_modules/@my-packages2/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@my-packages2/other/package.json': '{ "name": "@my-packages2/other", "version": "1.2.3" }',
			'/project/node_modules/@my-packages2/other/index.js': 'module.exports = \'Unrelated package\';',
			'/project/node_modules/other/index.js': 'module.exports = \'Unrelated package\';',
			'/project/node_modules/other/package.json': '{ "name": "other", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/package.json': '{ "name": "skivvy-package-goodbye", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'/project/node_modules/@skivvy/skivvy-package-hello/package.json': '{ "name": "skivvy-package-hello", "version": "1.2.3" }',
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};',
			'/project/skivvy_tasks/unused.js': 'module.exports = function() { console.warn(\'Unused task\'); }; module.exports.description = \'Unused task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: null,
				tasks: {
					'goodbye': require('/project/my-tasks/goodbye.js'),
					'hello': require('/project/my-tasks/hello.js')
				}
			},
			{
				name: '@my-packages1/hello',
				version: '1.2.3',
				tasks: {}
			},
			{
				name: '@my-packages2/goodbye',
				version: '1.2.3',
				tasks: {}
			},
			{
				name: 'goodbye',
				version: '1.2.3',
				tasks: {}
			},
			{
				name: 'hello',
				version: '1.2.3',
				tasks: {}
			}
		];
		actual = listPackages({ path: '/project', versions: true });
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
		expected = [
			{
				name: null,
				tasks: {}
			}
		];
		actual = listPackages({ path: '/project' });
		return expect(actual).to.eventually.eql(expected);
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'node_modules/@skivvy/skivvy-package-goodbye/index.js': 'exports.tasks = {};',
			'node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				name: null,
				tasks: {}
			},
			{
				name: 'goodbye',
				tasks: {}
			},
			{
				name: 'hello',
				tasks: {}
			}
		];
		actual = [
			listPackages(),
			listPackages({}),
			listPackages({ path: undefined }),
			listPackages({ path: null }),
			listPackages({ path: false }),
			listPackages({ path: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.eventually.eql(expected);
		}));
	});
});
