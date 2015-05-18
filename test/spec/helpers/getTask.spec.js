'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;

var getTask = require('../../../lib/helpers/getTask');

describe('helpers.getTask()', function() {
	var unmockFiles = null;

	beforeEach(function() {
		var pkg = {};
		var config = {};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'node_modules/@my-packages/skivvy-package-my-package/package.json': '{ "name": "skivvy-package-my-package" }',
			'node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped\': require(\'./tasks/scoped\') };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped.js': 'module.exports = function(config) { };',
			'node_modules/skivvy-package-my-package/package.json': '{ "name": "skivvy-package-my-package" }',
			'node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'external\': require(\'./tasks/external\') };',
			'node_modules/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { };'
		};
		unmockFiles = mockFiles(files);
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should load local tasks', function() {
		var expected, actual;
		expected = require('/skivvy_tasks/local');
		actual = getTask('local', null, '/');
		expect(actual).to.equal(expected);
	});

	it('should assign a displayName to local tasks', function() {
		var expected, actual;
		var task = getTask('local', null, '/');
		expected = 'local';
		actual = task.displayName;
		expect(actual).to.equal(expected);
	});

	it('should throw an error if local task does not exist', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = function() {
			return getTask('nonexistent', null, '/');
		};
		expect(actual).to.throw(expected);
	});

	it('should load external tasks', function() {
		var expected, actual;
		expected = require('/node_modules/skivvy-package-my-package/tasks/external');
		actual = getTask('external', 'my-package', '/');
		expect(actual).to.equal(expected);
	});

	it('should assign a displayName to external tasks', function() {
		var expected, actual;
		var task = getTask('external', 'my-package', '/');
		expected = 'my-package::external';
		actual = task.displayName;
		expect(actual).to.equal(expected);
	});

	it('should throw an error if external task does not exist', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = function() {
			return getTask('nonexistent', 'my-package', '/');
		};
		expect(actual).to.throw(expected);
	});

	it('should load scoped tasks', function() {
		var expected, actual;
		expected = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/scoped');
		actual = getTask('scoped', '@my-packages/my-package', '/');
		expect(actual).to.equal(expected);
	});

	it('should assign a displayName to scoped tasks', function() {
		var expected, actual;
		var task = getTask('scoped', '@my-packages/my-package', '/');
		expected = '@my-packages/my-package::scoped';
		actual = task.displayName;
		expect(actual).to.equal(expected);
	});

	it('should throw an error if scoped task does not exist', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = function() {
			return getTask('nonexistent', '@my-packages/my-package', '/');
		};
		expect(actual).to.throw(expected);
	});

	it('should load tasks from custom include paths', function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		var pkg = {};
		var config = {
			include: 'skivvy/tasks'
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'skivvy/tasks/local.js': 'module.exports = function(config) { };'
		};
		unmockFiles = mockFiles(files);
		var expected, actual;
		expected = require('/skivvy/tasks/local');
		actual = getTask('local', null, '/');
		expect(actual).to.equal(expected);
	});

	it('should load tasks from custom project paths', function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		var pkg = {};
		var config = {};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/skivvy_tasks/local.js': 'module.exports = function(config) { };'
		};
		unmockFiles = mockFiles(files);
		var expected, actual;
		expected = require('/project/skivvy_tasks/local');
		actual = getTask('local', null, '/project');
		expect(actual).to.equal(expected);
	});
});
