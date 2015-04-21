'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidNpmModuleError = require('../../../lib/errors').InvalidNpmModuleError;

var loadNpmConfig = require('../../../lib/helpers/loadNpmConfig');

describe('helpers.loadNpmConfig()', function() {
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
			function() { return loadNpmConfig(); },
			function() { return loadNpmConfig(undefined); },
			function() { return loadNpmConfig(null); },
			function() { return loadNpmConfig(false); },
			function() { return loadNpmConfig(''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should load package.json from the correct path', function() {
		var pkg = {
			name: 'hello-world',
			description: 'Hello World app',
			author: 'A User <user@example.com>'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = pkg;
		actual = loadNpmConfig('/project');
		return expect(actual).to.eql(expected);
	});

	it('should throw an error if package.json does not exist', function() {
		var files = {};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidNpmModuleError;
		actual = function() { return loadNpmConfig('/project'); };
		return expect(actual).to.throw(expected);
	});

	it('should throw an error if package.json is invalid', function() {
		var files = {
			'package.json': '{'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidNpmModuleError;
		actual = function() { return loadNpmConfig('/project'); };
		return expect(actual).to.throw(expected);
	});
});
