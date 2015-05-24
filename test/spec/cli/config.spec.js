'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

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

	it('should throw an error if no configuration updates are specified', function() {
		var args = [];
		var options = {
			environment: 'goodbye'
		};
		var expected = InvalidArgumentsError;
		var actual = cliConfig(args, options);
		expect(actual).to.be.rejectedWith(expected);
	});

	it('should update default environment configuration when no package is specified', function() {
		var args = [];
		var options = {
			config: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		var expected = {
			updates: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.updateEnvironmentConfig).to.have.been.calledWith(expected);
			});
	});

	it('should update package configuration if an external package is specified', function() {
		var args = [];
		var options = {
			package: 'my-package',
			config: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		var expected = {
			package: 'my-package',
			updates: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.updatePackageConfig).to.have.been.calledWith(expected);
			});
	});

	it('should update task configuration if a local task is specified', function() {
		var args = [];
		var options = {
			task: 'hello',
			target: 'custom',
			config: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		var expected = {
			task: 'hello',
			target: 'custom',
			package: null,
			updates: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.updateTaskConfig).to.have.been.calledWith(expected);
			});
	});

	it('should update task configuration if an external task is specified', function() {
		var args = [];
		var options = {
			task: 'hello',
			target: 'custom',
			package: 'my-package',
			config: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		var expected = {
			task: 'hello',
			target: 'custom',
			package: 'my-package',
			updates: {
				hello: 'world'
			},
			environment: 'goodbye'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.updateTaskConfig).to.have.been.calledWith(expected);
			});
	});

	it('should pass the project path to the API', function() {
		var args = [];
		var options = {
			config: {},
			path: '/project'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal('/project');
			});
	});

	it('should default to process.cwd() if no project path is specified', function() {
		var args = [];
		var options = {
			config: {}
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal(process.cwd());
			});
	});
});
