'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var mockCli = require('mock-cli');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;

var mockApiFactory = require('../../fixtures/mockApiFactory');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.config()', function() {
	var cliConfig;
	var MockApi;
	before(function() {
		MockApi = mockApiFactory();
		cliConfig = rewire('../../../lib/cli/config');
		cliConfig.__set__('Api', MockApi);
	});

	var unmockCli = null;
	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
		MockApi.reset();
	});

	describe('basic operation', function() {

		it('should throw an error if no operation is specified', function() {
			var args = [];
			var options = {};
			var promise = cliConfig(args, options);
			return expect(promise).to.be.rejectedWith(InvalidArgumentsError);
		});

		it('should throw an error if an invalid operation is specified', function() {
			var args = ['nonexistent'];
			var options = {};
			var promise = cliConfig(args, options);
			return expect(promise).to.be.rejectedWith(InvalidArgumentsError);
		});
	});

	describe('config get', function() {

		it('should get environment configuration', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {};
			MockApi.stubs.environmentConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getEnvironmentConfig).to.have.been.calledWith({
						expand: false
					});
				});
		});

		it('should get package configuration', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				package: 'package'
			};
			MockApi.stubs.packageConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getPackageConfig).to.have.been.calledWith({
						package: 'package',
						expand: false
					});
				});
		});

		it('should get local task configuration, default target', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				task: 'task'
			};
			MockApi.stubs.taskConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getTaskConfig).to.have.been.calledWith({
						task: 'task',
						expand: false
					});
				});
		});

		it('should get local task configuration, custom target', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				task: 'task',
				target: 'custom'
			};
			MockApi.stubs.taskConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getTaskConfig).to.have.been.calledWith({
						task: 'task:custom',
						expand: false
					});
				});
		});

		it('should get external task configuration, default target', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				task: 'task',
				package: 'package'
			};
			MockApi.stubs.taskConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getTaskConfig).to.have.been.calledWith({
						task: 'package::task',
						expand: false
					});
				});
		});

		it('should get external task configuration, custom target', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				task: 'task',
				target: 'custom',
				package: 'package'
			};
			MockApi.stubs.taskConfig = {
				message: 'Hello, world!'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					var cli = unmockCli();

					expect(returnValue).to.eql({
						message: 'Hello, world!'
					});
					expect(cli.stdout).to.equal(JSON.stringify({
						message: 'Hello, world!'
					}, null, 2) + '\n');
					expect(MockApi.instance.getTaskConfig).to.have.been.calledWith({
						task: 'package::task:custom',
						expand: false
					});
				});
		});

		it('should pass the project path and environment to the API', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {
				path: '/project',
				env: 'environment'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					unmockCli();
					expect(MockApi.instance.path).to.equal('/project');
					expect(MockApi.instance.environment).to.equal('environment');
				});
		});

		it('should default to process.cwd() if no project path is specified', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {};
			return cliConfig(args, options)
				.then(function(returnValue) {
					unmockCli();
					expect(MockApi.instance.path).to.equal(process.cwd());
				});
		});

		it('should default to default environment if no environment is specified', function() {
			unmockCli = mockCli();

			var args = ['get'];
			var options = {};
			return cliConfig(args, options)
				.then(function(returnValue) {
					unmockCli();
					expect(MockApi.instance.environment).to.equal('default');
				});
		});
	});

	describe('config set', function() {

		it('should throw an error if no configuration updates are specified', function() {
			var args = ['set'];
			var options = {
				env: 'goodbye'
			};
			var promise = cliConfig(args, options);
			return expect(promise).to.be.rejectedWith(InvalidArgumentsError);
		});

		it('should update default environment configuration when no package is specified', function() {
			var args = ['set'];
			var options = {
				config: {
					hello: 'world'
				},
				env: 'goodbye'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.environment).to.equal('goodbye');
					expect(MockApi.instance.updateEnvironmentConfig).to.have.been.calledWith({
						updates: {
							hello: 'world'
						}
					});
				});
		});

		it('should update package configuration if an external package is specified', function() {
			var args = ['set'];
			var options = {
				package: 'my-package',
				config: {
					hello: 'world'
				},
				env: 'goodbye'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.environment).to.equal('goodbye');
					expect(MockApi.instance.updatePackageConfig).to.have.been.calledWith({
						package: 'my-package',
						updates: {
							hello: 'world'
						}
					});
				});
		});

		it('should update task configuration if a local task is specified', function() {
			var args = ['set'];
			var options = {
				task: 'hello',
				target: 'custom',
				config: {
					hello: 'world'
				},
				env: 'goodbye'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.environment).to.equal('goodbye');
					expect(MockApi.instance.updateTaskConfig).to.have.been.calledWith({
						task: 'hello:custom',
						updates: {
							hello: 'world'
						}
					});
				});
		});

		it('should update task configuration if an external task is specified', function() {
			var args = ['set'];
			var options = {
				task: 'hello',
				target: 'custom',
				package: 'my-package',
				config: {
					hello: 'world'
				},
				env: 'goodbye'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.environment).to.equal('goodbye');
					expect(MockApi.instance.updateTaskConfig).to.have.been.calledWith({
						task: 'my-package::hello:custom',
						updates: {
							hello: 'world'
						}
					});
				});
		});

		it('should pass the project path and environment to the API', function() {
			var args = ['set'];
			var options = {
				config: {},
				path: '/project',
				env: 'environment'
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.path).to.equal('/project');
					expect(MockApi.instance.environment).to.equal('environment');
				});
		});

		it('should default to process.cwd() if no project path is specified', function() {
			var args = ['set'];
			var options = {
				config: {}
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					expect(MockApi.instance.path).to.equal(process.cwd());
				});
		});

		it('should default to default environment if no environment is specified', function() {
			unmockCli = mockCli();

			var args = ['set'];
			var options = {
				config: {}
			};
			return cliConfig(args, options)
				.then(function(returnValue) {
					unmockCli();
					expect(MockApi.instance.environment).to.equal('default');
				});
		});
	});
});
