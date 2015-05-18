'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;
var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;

var saveConfigJson = require('../../../lib/helpers/saveConfigJson');

chai.use(chaiAsPromised);

describe('helpers.saveConfigJson()', function() {
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
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		var updates = {
			project: {
				message: 'Hello, world!'
			}
		};
		expected = InvalidProjectError;
		actual = [
			saveConfigJson('', updates),
			saveConfigJson(undefined, updates),
			saveConfigJson(null, updates),
			saveConfigJson(false, updates)
		];

		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if invalid config specified', function() {
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
		expected = InvalidConfigError;
		actual = [
			saveConfigJson('/project', undefined),
			saveConfigJson('/project', null),
			saveConfigJson('/project', false),
			saveConfigJson('/project', true),
			saveConfigJson('/project', []),
			saveConfigJson('/project', ''),
			saveConfigJson('/project', '{}')
		];

		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should save config to the correct path', function() {
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
		var updates = {
			project: {
				message: 'Hello, world!'
			}
		};
		expected = updates;
		actual = saveConfigJson('/project', updates)
			.then(function() {
				return JSON.parse(fs.readFileSync('/project/skivvy.json', 'utf8'));
			});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should return a copy of the config object', function() {
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
		var updates = {
			project: {
				message: 'Hello, world!'
			}
		};
		expected = updates;
		actual = saveConfigJson('/project', updates);
		return Promise.all([
			expect(actual).to.eventually.eql(expected),
			expect(actual).to.not.eventually.equal(expected)
		]);
	});
});
