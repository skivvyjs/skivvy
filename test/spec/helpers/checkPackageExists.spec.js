'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var checkPackageExists = require('../../../lib/helpers/checkPackageExists');

chai.use(chaiAsPromised);


describe('helpers.checkPackageExists()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
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
			'/project/skivvy.json': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Scoped package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			checkPackageExists(undefined, '/project'),
			checkPackageExists(null, '/project'),
			checkPackageExists(false, '/project'),
			checkPackageExists('', '/project')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should return true if an external package matches', function() {
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
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Scoped package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = true;
		actual = checkPackageExists('hello-world', '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return true if a scoped package matches', function() {
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
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Scoped package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = true;
		actual = checkPackageExists('@my-packages/hello-world', '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return false if the specified package does not exist', function() {
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
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/@my-packages/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Scoped package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = false;
		actual = checkPackageExists('goodbye-world', '/project');
		return expect(actual).to.eventually.equal(expected);
	});
});
