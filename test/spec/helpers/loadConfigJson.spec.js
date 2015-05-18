'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;

var loadConfigJson = require('../../../lib/helpers/loadConfigJson');

describe('helpers.loadConfigJson()', function() {
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
			function() { return loadConfigJson(); },
			function() { return loadConfigJson(undefined); },
			function() { return loadConfigJson(null); },
			function() { return loadConfigJson(false); },
			function() { return loadConfigJson(''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should load config from the correct path', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {
					message: 'Hello, world!'
				}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = config;
		actual = loadConfigJson('/project');
		expect(actual).to.eql(expected);
	});

	it('should throw an error if config does not exist', function() {
		var pkg = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = function() { return loadConfigJson('/project'); };
		expect(actual).to.throw(expected);
	});

	it('should throw an error if config is invalid', function() {
		var pkg = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': '{'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = function() { return loadConfigJson('/project'); };
		expect(actual).to.throw(expected);
	});
});
