'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;
var MultipleMatchingTasksError = require('../../../lib/errors').MultipleMatchingTasksError;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.run()', function() {
	var MockApi;
	var cliRun = rewire('../../../lib/cli/run');
	var unmockFiles = null;

	before(function() {
		MockApi = mockApiFactory();
		cliRun.__set__('Api', MockApi);
	});

	beforeEach(function() {
		var pkg = {};
		var config = {};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'skivvy_tasks/local-conflict.js': 'module.exports = function(config) { };',
			'skivvy_tasks/series1.js': 'module.exports = function(config) { return \'series1\'; };',
			'skivvy_tasks/series2.js': 'module.exports = function(config) { return \'series2\'; };',
			'skivvy_tasks/series3.js': 'module.exports = function(config) { return \'series3\'; };',
			'node_modules/@skivvy/skivvy-package-my-package/package.json': '{ "name": "skivvy-package-my-package" }',
			'node_modules/@skivvy/skivvy-package-my-package/index.js': 'exports.tasks = { \'external\': require(\'./tasks/external\'), \'local-conflict\': require(\'./tasks/local-conflict\'), \'external-conflict\': require(\'./tasks/external-conflict\') };',
			'node_modules/@skivvy/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { };',
			'node_modules/@skivvy/skivvy-package-my-package/tasks/local-conflict.js': 'module.exports = function(config) { };',
			'node_modules/@skivvy/skivvy-package-my-package/tasks/external-conflict.js': 'module.exports = function(config) { };',
			'node_modules/@my-packages/skivvy-package-my-package/package.json': '{ "name": "@my-packages/skivvy-package-my-package" }',
			'node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped\': require(\'./tasks/scoped\'), \'local-conflict\': require(\'./tasks/local-conflict\'), \'external-conflict\': require(\'./tasks/external-conflict\') };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped.js': 'module.exports = function(config) { };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/local-conflict.js': 'module.exports = function(config) { };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/external-conflict.js': 'module.exports = function(config) { };',
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'/other/package.json': JSON.stringify(pkg),
			'/other/.skivvyrc': JSON.stringify(config),
			'/other/skivvy_tasks/cwd1.js': 'module.exports = function(config) { return process.cwd(); };',
			'/other/project/package.json': JSON.stringify(pkg),
			'/other/project/.skivvyrc': JSON.stringify(config),
			'/other/project/skivvy_tasks/cwd2.js': 'module.exports = function(config) { return process.cwd(); };'
		};
		unmockFiles = mockFiles(files);
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		MockApi.reset();
	});

	it('should pass project path and environment name to API', function() {
		var args = [
			'local'
		];
		var options = {
			path: '/project',
			env: 'production'
		};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.path).to.equal('/project');
				expect(MockApi.instance.environment).to.equal('production');
			});
	});

	it('should throw an error if no tasks are specified', function() {
		var args = [];
		var options = {};
		var promise = cliRun(args, options);
		return expect(promise).to.be.rejectedWith(InvalidArgumentsError);
	});

	it('should locate local tasks', function() {
		var args = [
			'local'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'local:default',
					config: null
				});
			});
	});

	it('should locate local tasks with custom target', function() {
		var args = [
			'local:custom'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'local:custom',
					config: null
				});
			});
	});

	it('should locate namespaced external tasks', function() {
		var args = [
			'my-package::external'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'my-package::external:default',
					config: null
				});
			});
	});

	it('should locate namespaced external tasks with custom target', function() {
		var args = [
			'my-package::external:custom'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'my-package::external:custom',
					config: null
				});
			});
	});

	it('should locate unnamespaced external tasks', function() {
		var args = [
			'external'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'my-package::external:default',
					config: null
				});
			});
	});

	it('should locate unnamespaced external tasks with custom target', function() {
		var args = [
			'external:custom'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: 'my-package::external:custom',
					config: null
				});
			});
	});

	it('should locate namespaced scoped tasks', function() {
		var args = [
			'@my-packages/my-package::scoped'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: '@my-packages/my-package::scoped:default',
					config: null
				});
			});
	});

	it('should locate namespaced scoped tasks with custom target', function() {
		var args = [
			'@my-packages/my-package::scoped:custom'
		];
		var options = {};
		return cliRun(args, options)
			.then(function() {
				expect(MockApi.instance.run).to.have.been.calledWith({
					task: '@my-packages/my-package::scoped:custom',
					config: null
				});
			});
	});

	it('should locate unnamespaced scoped tasks', function() {
		var args = [
			'scoped'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: '@my-packages/my-package::scoped:default',
					config: null
				};
				expect(MockApi.instance.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate unnamespaced scoped tasks with custom target', function() {
		var args = [
			'scoped:custom'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: '@my-packages/my-package::scoped:custom',
					config: null
				};
				expect(MockApi.instance.run).to.have.been.calledWith(expected);
			});
	});

	it('should prioritize local tasks over external tasks', function() {
		var args = [
			'local-conflict'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'local-conflict:default',
					config: null
				};
				expect(MockApi.instance.run).to.have.been.calledWith(expected);
			});
	});

	it('should prioritize namespaced tasks over local tasks', function() {
		var args = [
			'my-package::local-conflict'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'my-package::local-conflict:default',
					config: null
				};
				expect(MockApi.instance.run).to.have.been.calledWith(expected);
			});
	});

	it('should throw an error if there are multiple external matching tasks', function() {
		var args = [
			'external-conflict'
		];
		var options = {};
		var expected, actual;
		expected = MultipleMatchingTasksError;
		actual = cliRun(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should pass config to API method', function() {
		var args = [
			'local'
		];
		var options = {
			config: {
				user: 'world'
			}
		};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'local:default',
					config: {
						user: 'world'
					}
				};
				expect(MockApi.instance.run).to.have.been.calledWith(expected);
			});
	});

	it('should set the current working directory to the custom project path', function() {
		var args = [
			'local'
		];
		var options = {
			path: '/project'
		};
		var task = sinon.spy(function(options) {
			return process.cwd();
		});
		MockApi.stubs.run = task;
		return cliRun(args, options)
			.then(function(returnValue) {
				expect(returnValue).to.eql(['/project']);
			});
	});

	it('should call API method repeatedly for multiple tasks', function() {
		var args = [
			'series1',
			'series2',
			'series3'
		];
		var options = {};
		return cliRun(args, options)
			.then(function(returnValue) {
				expect(returnValue).to.eql(['hello', 'hello', 'hello']);
				var expectedCalls = [
					{
						task: 'series1:default',
						config: null
					},
					{
						task: 'series2:default',
						config: null
					},
					{
						task: 'series3:default',
						config: null
					}
				];
				expectedCalls.forEach(function(expected) {
					expect(MockApi.instance.run).to.have.been.calledWith(expected);
				});
			});
	});

	it('should allow custom working directory', function() {
		var args = [
			'cwd1'
		];
		var options = {
			cwd: '/other'
		};
		var run = sinon.spy(function(options) {
			return process.cwd();
		});
		MockApi.stubs.run = run;
		return cliRun(args, options)
			.then(function(returnValue) {
				expect(returnValue).to.eql(['/other']);
				expect(MockApi.instance.path).to.equal('/other');
				expect(run).to.have.been.calledWith({
					task: 'cwd1:default',
					config: null
				});
			});
	});

	it('should allow custom working directory with custom project path', function() {
		var args = [
			'cwd2'
		];
		var options = {
			cwd: '/other',
			path: './project'
		};
		var task = sinon.spy(function(options) {
			return process.cwd();
		});
		MockApi.stubs.run = task;
		return cliRun(args, options)
			.then(function(returnValue) {
				expect(returnValue).to.eql(['/other']);
				expect(MockApi.instance.path).to.equal('/other/project');
				expect(task).to.have.been.calledWith({
					task: 'cwd2:default',
					config: null
				});
			});
	});
});
