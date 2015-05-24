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

describe('cli.uninstall()', function() {
	var cliUninstall;
	var MockApi;

	before(function() {
		MockApi = mockApiFactory();
		cliUninstall = rewire('../../../lib/cli/uninstall');
		cliUninstall.__set__('Api', MockApi);
	});

	afterEach(function() {
		MockApi.reset();
	});

	it('should throw an error if no packages are specified', function() {
		var args = [];
		var options = {};
		var expected, actual;
		expected = InvalidArgumentsError;
		actual = cliUninstall(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should uninstall single packages', function() {
		var args = ['my-package'];
		var options = {};
		var expected;
		expected = {
			package: 'my-package'
		};
		return cliUninstall(args, options)
			.then(function() {
				expect(MockApi.instance.uninstallPackage).to.have.been.calledWith(expected);
			});
	});

	it('should uninstall multiple packages', function() {
		var args = ['my-package', '@my-packages/my-package'];
		var options = {};
		var expected;
		expected = [
			{
				package: 'my-package'
			},
			{
				package: '@my-packages/my-package'
			}
		];

		return cliUninstall(args, options)
			.then(function() {
				expected.forEach(function(expected) {
					expect(MockApi.instance.uninstallPackage).to.have.been.calledWith(expected);
				});
			});
	});

	it('should pass the project path to the API', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		return cliUninstall(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal('/project');
			});
	});

	it('should default to process.cwd() if no project path is specified', function() {
		var args = ['my-package'];
		var options = {};
		return cliUninstall(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal(process.cwd());
			});
	});
});
