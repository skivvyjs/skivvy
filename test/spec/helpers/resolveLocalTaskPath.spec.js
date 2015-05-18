'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;

var resolveLocalTaskPath = require('../../../lib/helpers/resolveLocalTaskPath');

describe('helpers.resolveLocalTaskPath()', function() {
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
			function() { return resolveLocalTaskPath(); },
			function() { return resolveLocalTaskPath('hello'); },
			function() { return resolveLocalTaskPath('hello', undefined); },
			function() { return resolveLocalTaskPath('hello', null); },
			function() { return resolveLocalTaskPath('hello', false); },
			function() { return resolveLocalTaskPath('hello', ''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should throw an error if no task name was specified', function() {
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
			'/project/skivvy_tasks/hello.js': 'module.exports = function(config) { }; module.exports.description = \'Hello World task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidTaskError;
		actual = [
			function() { return resolveLocalTaskPath(undefined, '/project'); },
			function() { return resolveLocalTaskPath(null, '/project'); },
			function() { return resolveLocalTaskPath(false, '/project'); },
			function() { return resolveLocalTaskPath('', '/project'); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should resolve local task paths', function() {
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
			'/project/skivvy_tasks/hello.js': 'module.exports = function(config) { }; module.exports.description = \'Hello World task\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = '/project/skivvy_tasks/hello.js';
		actual = resolveLocalTaskPath('hello', '/project');
		expect(actual).to.equal(expected);
	});
});
