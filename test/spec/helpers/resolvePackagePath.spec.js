'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var resolvePackagePath = require('../../../lib/helpers/resolvePackagePath');

describe('helpers.resolvePackagePath()', function() {
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
			function() { return resolvePackagePath(); },
			function() { return resolvePackagePath('hello'); },
			function() { return resolvePackagePath('hello', undefined); },
			function() { return resolvePackagePath('hello', null); },
			function() { return resolvePackagePath('hello', false); },
			function() { return resolvePackagePath('hello', ''); }
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
			function() { return resolvePackagePath(undefined, '/project'); },
			function() { return resolvePackagePath(null, '/project'); },
			function() { return resolvePackagePath(false, '/project'); },
			function() { return resolvePackagePath('', '/project'); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should resolve global package paths', function() {
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
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = '/project/node_modules/@skivvy/skivvy-package-hello';
		actual = resolvePackagePath('hello', '/project');
		expect(actual).to.equal(expected);
	});

	it('should resolve scoped package paths', function() {
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
			'/project/node_modules/@my-packages/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = '/project/node_modules/@my-packages/skivvy-package-hello';
		actual = resolvePackagePath('@my-packages/hello', '/project');
		expect(actual).to.equal(expected);
	});
});
