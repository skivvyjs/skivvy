'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;

var mockApiFactory = require('../../fixtures/mockApiFactory');
var cliConfig = rewire('../../../lib/cli/config');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.config()', function() {
	var api = mockApiFactory();
	var resetApi;

	before(function() {
		resetApi = cliConfig.__set__('api', api);
	});

	after(function() {
		resetApi();
	});

	afterEach(function() {
		api.reset();
	});

	it('should throw an error if no configuration updates are specified', function() {
		var args = [];
		var options = {
			environment: 'goodbye',
			path: '/project'
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
			environment: 'goodbye',
			path: '/project'
		};
		var expected = {
			updates: {
				hello: 'world'
			},
			environment: 'goodbye',
			path: '/project'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(api.updateEnvironmentConfig).to.have.been.calledWith(expected);
			});
	});

	it('should update package configuration if an external package is specified', function() {
		var args = [];
		var options = {
			package: 'my-package',
			config: {
				hello: 'world'
			},
			environment: 'goodbye',
			path: '/project'
		};
		var expected = {
			package: 'my-package',
			updates: {
				hello: 'world'
			},
			environment: 'goodbye',
			path: '/project'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(api.updatePackageConfig).to.have.been.calledWith(expected);
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
			environment: 'goodbye',
			path: '/project'
		};
		var expected = {
			task: 'hello',
			target: 'custom',
			package: null,
			updates: {
				hello: 'world'
			},
			environment: 'goodbye',
			path: '/project'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(api.updateTaskConfig).to.have.been.calledWith(expected);
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
			environment: 'goodbye',
			path: '/project'
		};
		var expected = {
			task: 'hello',
			target: 'custom',
			package: 'my-package',
			updates: {
				hello: 'world'
			},
			environment: 'goodbye',
			path: '/project'
		};
		return cliConfig(args, options)
			.then(function(returnValue) {
				expect(api.updateTaskConfig).to.have.been.calledWith(expected);
			});
	});
});
