'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;
var MultipleMatchingTasksError = require('../../../lib/errors').MultipleMatchingTasksError;

var mockApiFactory = require('../../fixtures/mockApiFactory');
var cliRun = rewire('../../../lib/cli/run');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.run()', function() {
	var api = mockApiFactory();
	var resetApi;
	var unmockFiles;

	before(function() {
		resetApi = cliRun.__set__('api', api);
	});

	after(function() {
		resetApi();
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
		api.reset();
	});

	it('should throw an error if no tasks are specified', function() {
		var args = [];
		var options = {};
		var expected, actual;
		expected = InvalidArgumentsError;
		actual = cliRun(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should locate local tasks', function() {
		var args = [
			'local'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'local',
					target: null,
					package: null,
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate local tasks with custom target', function() {
		var args = [
			'local:custom'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'local',
					target: 'custom',
					package: null,
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate namespaced external tasks', function() {
		var args = [
			'my-package::external'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'external',
					target: null,
					package: 'my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate namespaced external tasks with custom target', function() {
		var args = [
			'my-package::external:custom'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'external',
					target: 'custom',
					package: 'my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate unnamespaced external tasks', function() {
		var args = [
			'external'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'external',
					target: null,
					package: 'my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate unnamespaced external tasks with custom target', function() {
		var args = [
			'external:custom'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'external',
					target: 'custom',
					package: 'my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate namespaced scoped tasks', function() {
		var args = [
			'@my-packages/my-package::scoped'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'scoped',
					target: null,
					package: '@my-packages/my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should locate namespaced scoped tasks with custom target', function() {
		var args = [
			'@my-packages/my-package::scoped:custom'
		];
		var options = {};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'scoped',
					target: 'custom',
					package: '@my-packages/my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
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
					task: 'scoped',
					target: null,
					package: '@my-packages/my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
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
					task: 'scoped',
					target: 'custom',
					package: '@my-packages/my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
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
					task: 'local-conflict',
					target: null,
					package: null,
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
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
					task: 'local-conflict',
					target: null,
					package: 'my-package',
					environment: null,
					path: '/',
					config: null
				};
				expect(api.run).to.have.been.calledWith(expected);
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

	it('should pass additional parameters to API method', function() {
		var args = [
			'local'
		];
		var options = {
			config: {
				user: 'world'
			},
			environment: 'alternate',
			path: '/project'
		};
		var expected;
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'local',
					target: null,
					package: null,
					environment: 'alternate',
					path: '/project',
					config: {
						user: 'world'
					}
				};
				expect(api.run).to.have.been.calledWith(expected);
			});
	});

	it('should set the current working directory to the custom project path', function() {
		var args = [
			'local'
		];
		var options = {
			path: '/project'
		};
		var actualCwd = null;
		var expected, actual;
		var mockedApiMethod = api.run;
		api.run = function(options, callback) {
			actualCwd = process.cwd();
			return mockedApiMethod.apply(api, arguments);
		};
		return cliRun(args, options)
			.then(function() {
				expected = '/project';
				actual = actualCwd;
				expect(actual).to.equal(expected);
			})
			.finally(function() {
				api.run = mockedApiMethod;
			});
	});

	it('should call API method repeatedly for multiple tasks', function() {
		var args = [
			'series1',
			'series2',
			'series3'
		];
		var options = {};
		var actual, expected;
		return cliRun(args, options)
			.then(function(returnValue) {
				var stubResults = ['hello', 'hello', 'hello'];
				expected = stubResults;
				actual = returnValue;
				expect(actual).to.eql(expected);

				expected = [
					{
						task: 'series1',
						target: null,
						package: null,
						environment: null,
						path: '/',
						config: null
					},
					{
						task: 'series2',
						target: null,
						package: null,
						environment: null,
						path: '/',
						config: null
					},
					{
						task: 'series3',
						target: null,
						package: null,
						environment: null,
						path: '/',
						config: null
					}
				];
				expected.forEach(function(expected) {
					expect(api.run).to.have.been.calledWith(expected);
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
		var actualCwd = null;
		var expected, actual;
		var mockedApiMethod = api.run;
		api.run = function(options, callback) {
			actualCwd = process.cwd();
			return mockedApiMethod.apply(api, arguments);
		};
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'cwd1',
					target: null,
					package: null,
					environment: null,
					path: '/other',
					config: null
				};
				expect(mockedApiMethod).to.have.been.calledWith(expected);

				expected = '/other';
				actual = actualCwd;
				expect(actual).to.equal(expected);
			})
			.finally(function() {
				api.run = mockedApiMethod;
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
		var actualCwd = null;
		var expected, actual;
		var mockedApiMethod = api.run;
		api.run = function(options, callback) {
			actualCwd = process.cwd();
			return mockedApiMethod.apply(api, arguments);
		};
		return cliRun(args, options)
			.then(function() {
				expected = {
					task: 'cwd2',
					target: null,
					package: null,
					environment: null,
					path: '/other/project',
					config: null
				};
				expect(mockedApiMethod).to.have.been.calledWith(expected);

				expected = '/other';
				actual = actualCwd;
				expect(actual).to.equal(expected);
			})
			.finally(function() {
				api.run = mockedApiMethod;
			});
	});
});
