'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;

var checkTaskExists = require('../../../lib/helpers/checkTaskExists');

chai.use(chaiAsPromised);

describe('helpers.checkTaskExists()', function() {
	var unmockFiles = null;

	beforeEach(function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			tasks: {},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'external\': require(\'./tasks/external\') };',
			'/project/node_modules/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { };',
			'/project/node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped\': require(\'./tasks/scoped\') };',
			'/project/node_modules/@my-packages/skivvy-package-my-package/tasks/scoped.js': 'module.exports = function(config) { };'
		};
		unmockFiles = mockFiles(files);
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no task name was specified', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = [
			checkTaskExists(undefined, null, '/project'),
			checkTaskExists(null, null, '/project'),
			checkTaskExists(false, null, '/project'),
			checkTaskExists('', null, '/project')
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should return true if a local task matches', function() {
		var expected, actual;
		expected = true;
		actual = checkTaskExists('local', null, '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return false if a local task does not match', function() {
		var expected, actual;
		expected = false;
		actual = checkTaskExists('nonexistent', null, '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return true if an external task matches', function() {
		var expected, actual;
		expected = true;
		actual = checkTaskExists('external', 'my-package', '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return true if an external task does not match', function() {
		var expected, actual;
		expected = false;
		actual = checkTaskExists('nonexistent', 'my-package', '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return true if a scoped task matches', function() {
		var expected, actual;
		expected = true;
		actual = checkTaskExists('scoped', '@my-packages/my-package', '/project');
		return expect(actual).to.eventually.equal(expected);
	});

	it('should return false if a scoped task does not match', function() {
		var expected, actual;
		expected = false;
		actual = checkTaskExists('nonexistent', '@my-packages/my-package', '/project');
		return expect(actual).to.eventually.equal(expected);
	});
});
