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

describe('cli.install()', function() {
	var cliInstall;
	var MockApi;

	before(function() {
		MockApi = mockApiFactory();
		cliInstall = rewire('../../../lib/cli/install');
		cliInstall.__set__('Api', MockApi);
	});

	afterEach(function() {
		MockApi.reset();
	});

	it('should throw an error if no packages are specified', function() {
		var args = [];
		var options = {};
		var expected, actual;
		expected = InvalidArgumentsError;
		actual = cliInstall(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should install single packages', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = {
			package: 'my-package',
			path: '/project'
		};
		return cliInstall(args, options)
			.then(function() {
				expect(MockApi.instance.installPackage).to.have.been.calledWith(expected);
			});
	});

	it('should install multiple packages', function() {
		var args = ['my-package', '@my-packages/my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = [
			{
				package: 'my-package',
				path: '/project'
			},
			{
				package: '@my-packages/my-package',
				path: '/project'
			}
		];

		return cliInstall(args, options)
			.then(function() {
				expected.forEach(function(expected) {
					expect(MockApi.instance.installPackage).to.have.been.calledWith(expected);
				});
			});
	});

	it('should pass the project path to the API', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		return cliInstall(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal('/project');
			});
	});

	it('should default to process.cwd() if no project path is specified', function() {
		var args = ['my-package'];
		var options = {};
		return cliInstall(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal(process.cwd());
			});
	});
});
