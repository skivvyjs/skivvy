'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;

var checkProjectExists = require('../../../lib/helpers/checkProjectExists');

chai.use(chaiAsPromised);

describe('helpers.checkProjectExists()', function() {
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
			checkProjectExists(),
			checkProjectExists(undefined),
			checkProjectExists(null),
			checkProjectExists(false),
			checkProjectExists('')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should return true if a project exists at the specified path', function() {
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
		expected = true;
		actual = checkProjectExists('/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return false if a project does not exist at the specified path', function() {
		var pkg = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = false;
		actual = checkProjectExists('/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should throw an error if project config is invalid', function() {
		var pkg = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': '{'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidProjectError;
		actual = checkProjectExists('/project');
		return expect(actual).to.be.rejectedWith(expected);
	});
});
